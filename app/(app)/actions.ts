"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";

const activitySchema = z.object({
  group_id: z.string().uuid().optional().or(z.literal("personal")),
  title: z.string().min(3, "Il titolo deve avere almeno 3 caratteri."),
  description: z.string().optional(),
  category: z.string().min(2),
  status: z.enum(["draft", "planning", "scheduled", "completed", "cancelled"]),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
  location_name: z.string().optional(),
  location_address: z.string().optional(),
  budget_min: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
  budget_max: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
  duration: z.string().optional(),
  notes: z.string().optional(),
  participants: z.string().optional()
});

export async function createActivityAction(_: unknown, formData: FormData) {
  const parsed = activitySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Dati non validi." };

  const workspace = await getCurrentWorkspace();
  const supabase = await createClient();
  const data = parsed.data;
  const groupId = data.group_id && data.group_id !== "personal" ? data.group_id : null;

  if (groupId && !workspace.groups.some((group) => group.id === groupId)) {
    return { error: "Non puoi creare un ritrovo in questo gruppo." };
  }

  const { data: activity, error } = await supabase
    .from("activities")
    .insert({
      organization_id: workspace.organization.id,
      group_id: groupId,
      created_by: workspace.user.id,
      title: data.title,
      description: data.description || null,
      category: data.category,
      status: data.status,
      starts_at: data.starts_at || null,
      ends_at: data.ends_at || null,
      location_name: data.location_name || null,
      location_address: data.location_address || null,
      budget_min: data.budget_min === "" ? null : data.budget_min,
      budget_max: data.budget_max === "" ? null : data.budget_max,
      duration: data.duration || null,
      notes: data.notes || null
    })
    .select()
    .single();

  if (error) return { error: "Non riesco a creare il ritrovo. Controlla permessi e campi." };

  const participants = (data.participants ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (participants.length) {
    await supabase.from("activity_participants").insert(
      participants.map((value) => ({
        activity_id: activity.id,
        display_name: value.includes("@") ? null : value,
        email: value.includes("@") ? value : null,
        invited_by: workspace.user.id,
        status: "invited"
      }))
    );
  }

  revalidatePath("/attivita");
  revalidatePath("/dashboard");
  if (groupId) revalidatePath(`/gruppi/${groupId}`);
  redirect(`/attivita/${activity.id}`);
}

export async function updateRsvpAction(formData: FormData) {
  const activityId = String(formData.get("activityId"));
  const status = z.enum(["confirmed", "declined", "maybe"]).parse(formData.get("status"));
  const workspace = await getCurrentWorkspace();
  const supabase = await createClient();

  await supabase.from("activity_participants").upsert(
    { activity_id: activityId, user_id: workspace.user.id, display_name: workspace.profile?.full_name, status },
    { onConflict: "activity_id,user_id" }
  );
  revalidatePath(`/attivita/${activityId}`);
}

export async function createPollAction(formData: FormData) {
  const schema = z.object({
    activityId: z.string().uuid(),
    question: z.string().min(5),
    options: z.string().min(3)
  });
  const { activityId, question, options } = schema.parse(Object.fromEntries(formData));
  const workspace = await getCurrentWorkspace();
  const supabase = await createClient();
  const { data: poll, error } = await supabase.from("polls").insert({ activity_id: activityId, question, created_by: workspace.user.id }).select().single();
  if (!error && poll) {
    await supabase.from("poll_options").insert(
      options
        .split("\n")
        .map((label) => label.trim())
        .filter(Boolean)
        .map((label) => ({ poll_id: poll.id, label }))
    );
  }
  revalidatePath(`/attivita/${activityId}`);
}

export async function votePollAction(formData: FormData) {
  const pollId = z.string().uuid().parse(formData.get("pollId"));
  const optionId = z.string().uuid().parse(formData.get("optionId"));
  const activityId = z.string().uuid().parse(formData.get("activityId"));
  const workspace = await getCurrentWorkspace();
  const supabase = await createClient();

  await supabase.from("poll_votes").delete().eq("poll_id", pollId).eq("user_id", workspace.user.id);
  await supabase.from("poll_votes").insert({ poll_id: pollId, option_id: optionId, user_id: workspace.user.id });
  revalidatePath(`/attivita/${activityId}`);
}

export async function createAvailabilityOptionAction(formData: FormData) {
  const schema = z.object({
    activityId: z.string().uuid(),
    label: z.string().optional(),
    starts_at: z.string().min(1),
    ends_at: z.string().min(1)
  });
  const data = schema.parse(Object.fromEntries(formData));
  const workspace = await getCurrentWorkspace();
  const supabase = await createClient();

  await supabase.from("availability_options").insert({
    activity_id: data.activityId,
    label: data.label || null,
    starts_at: data.starts_at,
    ends_at: data.ends_at,
    created_by: workspace.user.id
  });
  revalidatePath(`/attivita/${data.activityId}`);
}

export async function respondAvailabilityAction(formData: FormData) {
  const optionId = z.string().uuid().parse(formData.get("optionId"));
  const activityId = z.string().uuid().parse(formData.get("activityId"));
  const status = z.enum(["available", "unavailable", "maybe"]).parse(formData.get("status"));
  const workspace = await getCurrentWorkspace();
  const supabase = await createClient();

  await supabase.from("availability_responses").upsert({ option_id: optionId, user_id: workspace.user.id, status }, { onConflict: "option_id,user_id" });
  revalidatePath(`/attivita/${activityId}`);
}

export async function updateGroupAction(_: unknown, formData: FormData) {
  const groupId = z.string().uuid().parse(formData.get("groupId"));
  const name = z.string().min(2).parse(formData.get("name"));
  const description = z.string().optional().parse(formData.get("description") ?? "");
  const workspace = await getCurrentWorkspace();
  const supabase = await createClient();

  if (!workspace.groups.some((group) => group.id === groupId && ["owner", "admin"].includes(group.role))) {
    return { error: "Non puoi modificare questo gruppo." };
  }

  const { error } = await supabase.from("groups").update({ name, description }).eq("id", groupId);
  if (error) return { error: "Non riesco ad aggiornare il gruppo." };
  revalidatePath("/impostazioni/gruppo");
  revalidatePath(`/gruppi/${groupId}`);
  return { success: "Gruppo aggiornato." };
}

export async function inviteMemberAction(formData: FormData) {
  const groupId = z.string().uuid().parse(formData.get("groupId"));
  const email = z.string().email().parse(formData.get("email"));
  const role = z.enum(["admin", "member"]).parse(formData.get("role"));
  const workspace = await getCurrentWorkspace();
  const supabase = await createClient();

  if (!workspace.groups.some((group) => group.id === groupId && ["owner", "admin"].includes(group.role))) {
    return;
  }

  await supabase.from("invitations").insert({
    organization_id: workspace.organization.id,
    group_id: groupId,
    email,
    role,
    invited_by: workspace.user.id
  });
  revalidatePath("/impostazioni/gruppo");
  revalidatePath(`/gruppi/${groupId}`);
}

export async function createGroupAction(_: unknown, formData: FormData) {
  const schema = z.object({
    name: z.string().min(2, "Inserisci un nome gruppo."),
    description: z.string().optional()
  });
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Dati non validi." };

  const workspace = await getCurrentWorkspace();
  const supabase = await createClient();
  const { data: group, error } = await supabase
    .from("groups")
    .insert({
      organization_id: workspace.organization.id,
      name: parsed.data.name,
      description: parsed.data.description || null,
      created_by: workspace.user.id
    })
    .select()
    .single();

  if (error) return { error: "Non riesco a creare il gruppo." };

  await supabase.from("group_members").insert({ group_id: group.id, user_id: workspace.user.id, role: "owner" });
  revalidatePath("/gruppi");
  redirect(`/gruppi/${group.id}`);
}

export async function uploadPhotoAction(_: unknown, formData: FormData) {
  const activityId = z.string().uuid().parse(formData.get("activityId"));
  const caption = z.string().max(160).optional().parse(formData.get("caption") ?? "");
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { error: "Seleziona una foto da caricare." };

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) return { error: "Formato non supportato. Usa JPEG, PNG, WebP o GIF." };
  if (file.size > 5 * 1024 * 1024) return { error: "La foto deve pesare al massimo 5 MB." };

  const workspace = await getCurrentWorkspace();
  const supabase = await createClient();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${workspace.user.id}/${activityId}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage.from("activity-photos").upload(path, file, {
    contentType: file.type,
    upsert: false
  });
  if (uploadError) return { error: "Upload non riuscito. Verifica bucket e permessi Storage." };

  const { error } = await supabase.from("activity_photos").insert({
    activity_id: activityId,
    uploaded_by: workspace.user.id,
    storage_path: path,
    caption: caption || null
  });
  if (error) return { error: "Foto caricata, ma non salvata nel database." };

  revalidatePath(`/attivita/${activityId}`);
  return { success: "Foto caricata." };
}

export async function deletePhotoAction(formData: FormData) {
  const activityId = z.string().uuid().parse(formData.get("activityId"));
  const photoId = z.string().uuid().parse(formData.get("photoId"));
  const storagePath = z.string().min(1).parse(formData.get("storagePath"));
  const supabase = await createClient();

  await supabase.from("activity_photos").delete().eq("id", photoId);
  await supabase.storage.from("activity-photos").remove([storagePath]);
  revalidatePath(`/attivita/${activityId}`);
}
