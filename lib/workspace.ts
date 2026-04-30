import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Group, Organization, Profile } from "@/lib/database.types";

export type Workspace = {
  user: { id: string; email?: string };
  profile: Profile | null;
  organization: Organization;
  groups: Array<Group & { role: string }>;
  role: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

export async function getCurrentWorkspace(): Promise<Workspace> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const userId = auth.user.id;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();

  const { data: membership } = await supabase
    .from("organization_members")
    .select("role, organizations(*)")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  let organization = membership?.organizations as Organization | undefined;
  const role = membership?.role ?? "owner";

  if (!organization) {
    const baseName = profile?.full_name ? `Ritrovo di ${profile.full_name.split(" ")[0]}` : "Il mio Ritrovo";
    const slug = `${slugify(baseName)}-${userId.slice(0, 6)}`;
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .insert({ name: baseName, slug, created_by: userId })
      .select()
      .single();
    if (orgError) throw orgError;
    organization = org as Organization;

    await supabase.from("organization_members").insert({ organization_id: organization.id, user_id: userId, role: "owner" });
  }

  const { data: groupMemberships } = await supabase
    .from("group_members")
    .select("role, groups(*)")
    .eq("user_id", userId);

  const groups = (groupMemberships ?? [])
    .map((membership) => {
      const group = Array.isArray(membership.groups) ? membership.groups[0] : membership.groups;
      return group ? ({ ...(group as Group), role: membership.role } as Group & { role: string }) : null;
    })
    .filter((group): group is Group & { role: string } => Boolean(group));

  return { user: { id: userId, email: auth.user.email }, profile: profile as Profile | null, organization, groups, role };
}
