import { createClient } from "@/lib/supabase/server";
import type {
  Activity,
  ActivityParticipant,
  ActivityPhoto,
  AvailabilityOption,
  AvailabilityResponse,
  Group,
  Poll,
  PollOption,
  PollVote,
  Profile
} from "@/lib/database.types";

export async function listActivities(groupId: string, filters?: { q?: string; status?: string; category?: string }) {
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

export async function getDashboardData(groupId: string) {
  const activities = await listActivities(groupId);
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

export async function getActivityDetail(activityId: string) {
  const supabase = await createClient();
  const { data: activity, error } = await supabase.from("activities").select("*").eq("id", activityId).single();
  if (error) throw error;

  const [{ data: participants }, { data: photos }, { data: options }, { data: responses }, { data: polls }, { data: pollOptions }, { data: votes }] =
    await Promise.all([
      supabase.from("activity_participants").select("*").eq("activity_id", activityId),
      supabase.from("activity_photos").select("*").eq("activity_id", activityId).order("created_at", { ascending: false }),
      supabase.from("availability_options").select("*").eq("activity_id", activityId).order("starts_at"),
      supabase.from("availability_responses").select("*"),
      supabase.from("polls").select("*").eq("activity_id", activityId).order("created_at", { ascending: false }),
      supabase.from("poll_options").select("*"),
      supabase.from("poll_votes").select("*")
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
    pollVotes: (votes ?? []) as PollVote[]
  };
}

export async function getGroupSettings(groupId: string) {
  const supabase = await createClient();
  const [{ data: group }, { data: members }] = await Promise.all([
    supabase.from("groups").select("*").eq("id", groupId).single(),
    supabase.from("group_members").select("id, role, user_id, profiles(*)").eq("group_id", groupId)
  ]);

  return {
    group: group as Group,
    members: (members ?? []) as Array<{ id: string; role: string; user_id: string; profiles: Profile | null }>
  };
}
