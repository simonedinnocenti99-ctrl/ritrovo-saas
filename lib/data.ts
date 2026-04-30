import { createClient } from "@/lib/supabase/server";
import type {
  Activity,
  ActivityParticipant,
  ActivityPhoto,
  AvailabilityOption,
  AvailabilityResponse,
  Group,
  Invitation,
  Poll,
  PollOption,
  PollVote,
  Profile
} from "@/lib/database.types";

type ActivityFilters = { q?: string; status?: string; category?: string };

function filterActivities(activities: Activity[], filters?: ActivityFilters) {
  return activities.filter((activity) => {
    if (filters?.q && !activity.title.toLowerCase().includes(filters.q.toLowerCase())) return false;
    if (filters?.category && filters.category !== "all" && activity.category !== filters.category) return false;
    if (filters?.status === "future" && !["draft", "planning", "scheduled"].includes(activity.status)) return false;
    if (filters?.status === "past" && activity.status !== "completed") return false;
    return true;
  });
}

export async function listGroupActivities(groupId: string, filters?: ActivityFilters) {
  const supabase = await createClient();
  let query = supabase.from("activities").select("*").eq("group_id", groupId).order("starts_at", { ascending: false, nullsFirst: false });

  if (filters?.q) query = query.ilike("title", `%${filters.q}%`);
  if (filters?.category && filters.category !== "all") query = query.eq("category", filters.category);
  if (filters?.status === "future") query = query.in("status", ["draft", "planning", "scheduled"]);
  if (filters?.status === "past") query = query.eq("status", "completed");

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Activity[];
}

export async function listMyActivities(userId: string, organizationId: string, filters?: ActivityFilters) {
  const supabase = await createClient();

  const [{ data: activities, error }, { data: participantRows }] = await Promise.all([
    supabase.from("activities").select("*").eq("organization_id", organizationId).order("starts_at", { ascending: false, nullsFirst: false }),
    supabase.from("activity_participants").select("activity_id").eq("user_id", userId)
  ]);

  if (error) throw error;

  const participantActivityIds = new Set((participantRows ?? []).map((row) => row.activity_id));
  const visibleActivities = ((activities ?? []) as Activity[]).filter(
    (activity) => activity.created_by === userId || activity.group_id || participantActivityIds.has(activity.id)
  );

  return filterActivities(visibleActivities, filters);
}

export async function listActivities(groupId: string, filters?: ActivityFilters) {
  return listGroupActivities(groupId, filters);
}

async function getActivitySummary(activities: Activity[]) {
  const upcoming = activities.filter((activity) => ["draft", "planning", "scheduled"].includes(activity.status)).slice(0, 4);
  const past = activities.filter((activity) => activity.status === "completed").slice(0, 4);
  const activityIds = activities.map((activity) => activity.id);

  const supabase = await createClient();
  const { data: polls } = activityIds.length
    ? await supabase.from("polls").select("*").in("activity_id", activityIds).eq("status", "open").limit(5)
    : { data: [] };
  const { data: availability } = activityIds.length
    ? await supabase.from("availability_options").select("*").in("activity_id", activityIds).limit(5)
    : { data: [] };

  return { upcoming, past, openPolls: (polls ?? []) as Poll[], availability: (availability ?? []) as AvailabilityOption[] };
}

export async function getDashboardData(userId: string, organizationId: string) {
  const activities = await listMyActivities(userId, organizationId);
  return getActivitySummary(activities);
}

export async function getGroupDashboardData(groupId: string) {
  const activities = await listGroupActivities(groupId);
  return getActivitySummary(activities);
}

export async function getUserGroups(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("group_members").select("role, groups(*)").eq("user_id", userId);
  if (error) throw error;

  return (data ?? [])
    .map((membership) => {
      const group = Array.isArray(membership.groups) ? membership.groups[0] : membership.groups;
      return group ? ({ ...(group as Group), role: membership.role } as Group & { role: string }) : null;
    })
    .filter((group): group is Group & { role: string } => Boolean(group));
}

export async function getActivityDetail(activityId: string) {
  const supabase = await createClient();
  const { data: activity, error } = await supabase.from("activities").select("*").eq("id", activityId).single();
  if (error) throw error;

  const [{ data: participants }, { data: photos }, { data: options }, { data: responses }, { data: polls }, { data: pollOptions }, { data: votes }, { data: invitations }] =
    await Promise.all([
      supabase.from("activity_participants").select("*").eq("activity_id", activityId),
      supabase.from("activity_photos").select("*").eq("activity_id", activityId).order("created_at", { ascending: false }),
      supabase.from("availability_options").select("*").eq("activity_id", activityId).order("starts_at"),
      supabase.from("availability_responses").select("*"),
      supabase.from("polls").select("*").eq("activity_id", activityId).order("created_at", { ascending: false }),
      supabase.from("poll_options").select("*"),
      supabase.from("poll_votes").select("*"),
      supabase.from("invitations").select("*").eq("activity_id", activityId).eq("status", "pending").order("created_at", { ascending: false })
    ]);

  const photoRows = (photos ?? []) as ActivityPhoto[];
  const signedPhotos = await Promise.all(
    photoRows.map(async (photo) => {
      const { data } = await supabase.storage.from("activity-photos").createSignedUrl(photo.storage_path, 60 * 10);
      return { ...photo, signedUrl: data?.signedUrl };
    })
  );

  return {
    activity: activity as Activity,
    participants: (participants ?? []) as ActivityParticipant[],
    photos: signedPhotos,
    availabilityOptions: (options ?? []) as AvailabilityOption[],
    availabilityResponses: (responses ?? []) as AvailabilityResponse[],
    polls: (polls ?? []) as Poll[],
    pollOptions: (pollOptions ?? []) as PollOption[],
    pollVotes: (votes ?? []) as PollVote[],
    invitations: (invitations ?? []) as Invitation[]
  };
}

type GroupMemberWithProfile = {
  id: string;
  role: string;
  user_id: string;
  profiles: Profile | null;
};

export async function getGroupSettings(groupId: string) {
  const supabase = await createClient();
  const [{ data: group }, { data: members }, { data: invitations }] = await Promise.all([
    supabase.from("groups").select("*").eq("id", groupId).single(),
    supabase.from("group_members").select("id, role, user_id, profiles(*)").eq("group_id", groupId),
    supabase.from("invitations").select("*").eq("group_id", groupId).eq("status", "pending").order("created_at", { ascending: false })
  ]);

  const normalizedMembers: GroupMemberWithProfile[] = (members ?? []).map((member) => {
    const profile = Array.isArray(member.profiles) ? member.profiles[0] ?? null : member.profiles ?? null;

    return {
      id: member.id,
      role: member.role,
      user_id: member.user_id,
      profiles: profile as Profile | null
    };
  });

  return {
    group: group as Group,
    members: normalizedMembers,
    invitations: (invitations ?? []) as Invitation[]
  };
}
