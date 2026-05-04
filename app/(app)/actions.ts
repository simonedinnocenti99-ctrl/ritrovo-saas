"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { sendActivityInviteEmail, sendGroupInviteEmail, summarizeEmailResults } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";

const activitySchema = z.object({
  activity_type: z.enum(["personal", "group", "public"]).default("personal"),
  group_id: z.string().uuid().optional().or(z.literal("personal")),
  title: z.string().min(3, "Il titolo deve avere almeno 3 caratteri."),
  description: z.string().optional(),
  category: z.string().min(2),
  status: z.enum(["draft", "planning", "scheduled", "completed", "cancelled"]),
  date_mode: z.enum(["fixed", "poll", "options"]).default("fixed"),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
  availability_1_start: z.string().optional(),
  availability_1_end: z.string().optional(),
  availability_2_start: z.string().optional(),
  availability_2_end: z.string().optional(),
  availability_3_start: z.string().optional(),
  availability_3_end: z.string().optional(),
  poll_deadline: z.string().optional(),
  location_name: z.string().optional(),
  location_address: z.string().optional(),
  map_link: z.string().optional(),
  location_mode: z.enum(["offline", "online"]).default("offline"),
  location_notes: z.string().optional(),
  budget_min: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
  budget_max: z.coerce.number().int().nonnegative().optional().or(z.literal("")),
  budget_type: z.enum(["free", "per_person", "estimated", "contribution", "tbd"]).default("tbd"),
  currency: z.string().optional(),
  payment_notes: z.string().optional(),
  duration: z.string().optional(),
  notes: z.string().optional(),
  participants: z.string().optional(),
  privacy: z.string().min(2, "Scegli una privacy per il ritrovo."),
  max_participants: z.coerce.number().int().positive().optional().or(z.literal("")),
  recurrence: z.string().optional(),
  template: z.string().optional()
}).superRefine((data, context) => {
  const isDraft = data.status === "draft";

  if (data.activity_type === "group" && (!data.group_id || data.group_id === "personal")) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["group_id"], message: "Scegli il gruppo collegato al ritrovo." });
  }

  if (data.activity_type === "public") {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["activity_type"], message: "I ritrovi pubblici sono predisposti nell'interfaccia ma non ancora collegati al backend." });
  }

  const availabilityStarts = [data.availability_1_start, data.availability_2_start, data.availability_3_start].filter(Boolean);
  if (!isDraft && data.date_mode === "fixed" && !data.starts_at) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["starts_at"], message: "Scegli data e ora di inizio oppure usa un sondaggio disponibilita." });
  }
  if (!isDraft && data.date_mode !== "fixed" && availabilityStarts.length === 0) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["availability_1_start"], message: "Aggiungi almeno una opzione di data per il sondaggio." });
  }

  const futureValues = data.date_mode === "fixed" ? [data.starts_at] : availabilityStarts;
  const pastValue = futureValues.find((value) => value && new Date(value).getTime() <= Date.now());
  if (!isDraft && pastValue) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["starts_at"], message: "Usa una data futura." });
  }

  if (data.budget_min !== "" && data.budget_max !== "" && Number(data.budget_min) > Number(data.budget_max)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["budget_max"], message: "L'importo massimo deve essere maggiore o uguale al minimo." });
  }

  const participantEmails = (data.participants ?? "")
    .split(/[\s,;]+/)
    .map((item) => item.trim())
    .filter((item) => item.includes("@"));
  const invalidEmail = participantEmails.find((email) => !z.string().email().safeParse(email).success);
  if (invalidEmail) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["participants"], message: `Email invito non valida: ${invalidEmail}` });
  }
});

export async function createActivityAction(_: unknown, formData: FormData) {
  const parsed = activitySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Dati non validi." };

  const workspace = await getCurrentWorkspace();
  const supabase = await createClient();
  const data = parsed.data;
  const groupId = data.activity_type === "group" && data.group_id && data.group_id !== "personal" ? data.group_id : null;

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
      status: data.date_mode === "fixed" && data.starts_at && data.status !== "draft" ? "scheduled" : data.status,
      starts_at: data.date_mode === "fixed" ? data.starts_at || null : null,
      ends_at: data.date_mode === "fixed" ? data.ends_at || null : null,
      location_name: data.location_name || null,
      location_address: [data.location_address, data.map_link].filter(Boolean).join(" | ") || null,
      budget_min: data.budget_min === "" ? null : data.budget_min,
      budget_max: data.budget_max === "" ? null : data.budget_max,
      duration: data.duration || null,
      notes: [
        data.notes,
        data.location_mode === "online" ? "Ritrovo online" : null,
        data.location_notes ? `Note luogo: ${data.location_notes}` : null,
        data.poll_deadline ? `Scadenza sondaggio disponibilita: ${data.poll_deadline}` : null,
        data.budget_type ? `Budget/prezzo: ${data.budget_type}` : null,
        data.currency ? `Valuta: ${data.currency}` : null,
        data.payment_notes ? `Pagamento: ${data.payment_notes}` : null,
        data.privacy ? `Privacy: ${data.privacy}` : null,
        data.max_participants !== "" && data.max_participants ? `Massimo partecipanti: ${data.max_participants}` : null,
        data.recurrence && data.recurrence !== "once" ? `Ricorrenza predisposta: ${data.recurrence}` : null
      ].filter(Boolean).join("\n") || null
    })
    .select()
    .single();

  if (error) return { error: "Non riesco a creare il ritrovo. Controlla permessi e campi." };

  if (data.date_mode !== "fixed") {
    const options = [
      { starts_at: data.availability_1_start, ends_at: data.availability_1_end, label: "Opzione 1" },
      { starts_at: data.availability_2_start, ends_at: data.availability_2_end, label: "Opzione 2" },
      { starts_at: data.availability_3_start, ends_at: data.availability_3_end, label: "Opzione 3" }
    ].filter((option): option is { starts_at: string; ends_at: string | undefined; label: string } => Boolean(option.starts_at));

    if (options.length) {
      const { error: availabilityError } = await supabase.from("availability_options").insert(
        options.map((option) => ({
          activity_id: activity.id,
          starts_at: option.starts_at,
          ends_at: option.ends_at || option.starts_at,
          label: option.label,
          created_by: workspace.user.id
        }))
      );
      if (availabilityError) return { error: "Ritrovo creato, ma non riesco a salvare le opzioni disponibilita." };
    }
  }

  const participants = (data.participants ?? "")
    .split(/[\s,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (participants.length) {
    const { error: participantsError } = await supabase.from("activity_participants").insert(
      participants.map((value) => ({
        activity_id: activity.id,
        display_name: value.includes("@") ? null : value,
        email: value.includes("@") ? value.toLowerCase() : null,
        invited_by: workspace.user.id,
        status: "invited"
      }))
    );
    if (participantsError) return { error: "Ritrovo creato, ma non riesco a salvare i partecipanti." };

    const participantEmails = Array.from(new Set(participants.filter((value) => value.includes("@")).map((value) => value.toLowerCase())));
    if (participantEmails.length) {
      const { error: inviteError } = await supabase.from("invitations").insert(
        participantEmails.map((email) => ({
          organization_id: workspace.organization.id,
          activity_id: activity.id,
          email,
          role: "guest",
          invited_by: workspace.user.id
        }))
      );
      if (inviteError) return { error: "Ritrovo creato, ma non riesco a generare i link invito." };
    }

    const emailMessage = await summarizeEmailResults(
      await Promise.all(
        participantEmails.map((email) =>
          sendActivityInviteEmail({
            to: email,
            activityTitle: activity.title,
            inviterName: workspace.profile?.full_name || workspace.user.email || "Un organizzatore",
            startsAt: activity.starts_at,
            locationName: activity.location_name,
            activityId: activity.id
          })
        )
      )
    );
    if (emailMessage) return { error: `Ritrovo creato. ${emailMessage}` };
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
  const role = z.enum(["member", "guest"]).parse(formData.get("role"));
  const workspace = await getCurrentWorkspace();
  const supabase = await createClient();

  if (!workspace.groups.some((group) => group.id === groupId && ["owner", "admin"].includes(group.role))) {
    return;
  }

  const { data: invitation, error } = await supabase
    .from("invitations")
    .insert({
      organization_id: workspace.organization.id,
      group_id: groupId,
      email,
      role,
      invited_by: workspace.user.id
    })
    .select("token")
    .single();
  if (error) return;

  const groupName = workspace.groups.find((group) => group.id === groupId)?.name ?? "Ritrovo";
  const emailMessage = await summarizeEmailResults([
    await sendGroupInviteEmail({
      to: email,
      groupName,
      inviterName: workspace.profile?.full_name || workspace.user.email || "Un organizzatore",
      token: invitation.token
    })
  ]);
  revalidatePath("/impostazioni/gruppo");
  revalidatePath(`/gruppi/${groupId}`);
  if (emailMessage) console.warn(emailMessage);
}

export async function createGroupAction(_: unknown, formData: FormData) {
  const schema = z.object({
    name: z.string().min(2, "Inserisci un nome gruppo."),
    description: z.string().optional(),
    invite_emails: z.string().optional(),
    invite_role: z.enum(["member", "guest"]).default("member")
  });
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Dati non validi." };

  const inviteEmails = Array.from(
    new Set(
      (parsed.data.invite_emails ?? "")
        .split(/[\s,;]+/)
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean)
    )
  );
  const invalidEmail = inviteEmails.find((email) => !z.string().email().safeParse(email).success);
  if (invalidEmail) return { error: `Email invito non valida: ${invalidEmail}` };

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
  if (inviteEmails.length) {
    const { data: invitations, error: inviteError } = await supabase
      .from("invitations")
      .insert(
        inviteEmails.map((email) => ({
          organization_id: workspace.organization.id,
          group_id: group.id,
          email,
          role: parsed.data.invite_role,
          invited_by: workspace.user.id
        }))
      )
      .select("email, token");
    if (inviteError) return { error: "Gruppo creato, ma non riesco a salvare gli inviti." };

    const emailMessage = await summarizeEmailResults(
      await Promise.all(
        (invitations ?? []).map((invitation) =>
          sendGroupInviteEmail({
            to: invitation.email,
            groupName: group.name,
            inviterName: workspace.profile?.full_name || workspace.user.email || "Un organizzatore",
            token: invitation.token
          })
        )
      )
    );
    if (emailMessage) return { error: `Gruppo creato. ${emailMessage}` };
  }

  revalidatePath("/gruppi");
  revalidatePath(`/gruppi/${group.id}`);
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
  const { data: activity } = await supabase.from("activities").select("group_id").eq("id", activityId).single();
  if (activity?.group_id) revalidatePath(`/gruppi/${activity.group_id}`);
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
  const { data: activity } = await supabase.from("activities").select("group_id").eq("id", activityId).single();
  if (activity?.group_id) revalidatePath(`/gruppi/${activity.group_id}`);
}
