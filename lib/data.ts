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
export type ActivityListFilters = ActivityFilters & {
  group?: string;
  tab?: string;
  context?: string;
  action?: string;
  sort?: string;
};

export type ActivityListItem = Activity & {
  contextLabel: string;
  contextType: "personal" | "group" | "public" | "public-business";
  groupName: string | null;
  participantCounts: {
    confirmed: number;
    maybe: number;
    pending: number;
    declined: number;
  };
  pendingInvitations: number;
  openPollsCount: number;
  hasOpenPoll: boolean;
  needsResponse: boolean;
  pendingRequests: number;
};

export type GroupListItem = Group & {
  role: string;
  memberCount: number | null;
  activityCount: number | null;
};

export type GroupPhotoItem = ActivityPhoto & {
  activityTitle: string;
  activityStartsAt: string | null;
};

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

export async function listMyActivities(userId: string, filters?: ActivityFilters) {
  const supabase = await createClient();

  const [{ data: activities, error }, { data: participantRows }] = await Promise.all([
    supabase.from("activities").select("*").order("starts_at", { ascending: false, nullsFirst: false }),
    supabase.from("activity_participants").select("activity_id").eq("user_id", userId)
  ]);

  if (error) throw error;

  const participantActivityIds = new Set((participantRows ?? []).map((row) => row.activity_id));
  const visibleActivities = ((activities ?? []) as Activity[]).filter(
    (activity) => activity.created_by === userId || activity.group_id || participantActivityIds.has(activity.id)
  );

  return filterActivities(visibleActivities, filters);
}

function sortActivityList(activities: ActivityListItem[], sort = "relevant") {
  const timeValue = (activity: ActivityListItem) => (activity.starts_at ? new Date(activity.starts_at).getTime() : Number.MAX_SAFE_INTEGER);
  const updatedValue = (activity: ActivityListItem) => new Date(activity.updated_at).getTime();
  const actionWeight = (activity: ActivityListItem) => {
    if (activity.pendingRequests > 0) return 0;
    if (activity.participantCounts.pending > 0) return 1;
    if (activity.hasOpenPoll || activity.status === "planning" || !activity.starts_at || !activity.location_name) return 2;
    if (activity.status === "draft") return 3;
    return 4;
  };

  return [...activities].sort((a, b) => {
    if (sort === "recent") return updatedValue(b) - updatedValue(a);
    if (sort === "todo") return actionWeight(a) - actionWeight(b) || timeValue(a) - timeValue(b);
    if (sort === "participants") {
      const totalA = a.participantCounts.confirmed + a.participantCounts.maybe + a.participantCounts.pending;
      const totalB = b.participantCounts.confirmed + b.participantCounts.maybe + b.participantCounts.pending;
      return totalB - totalA || timeValue(a) - timeValue(b);
    }
    if (sort === "requests") return b.pendingRequests - a.pendingRequests || b.participantCounts.pending - a.participantCounts.pending;
    if (sort === "alphabetic") return a.title.localeCompare(b.title, "it");
    return actionWeight(a) - actionWeight(b) || timeValue(a) - timeValue(b) || updatedValue(b) - updatedValue(a);
  });
}

function filterActivityList(activities: ActivityListItem[], userId: string, filters?: ActivityListFilters) {
  return activities.filter((activity) => {
    if (filters?.q && !activity.title.toLowerCase().includes(filters.q.toLowerCase())) return false;
    if (filters?.category && filters.category !== "all" && activity.category !== filters.category) return false;
    if (filters?.group && filters.group !== "all" && activity.group_id !== filters.group) return false;
    if (filters?.context === "personal" && activity.contextType !== "personal") return false;
    if (filters?.context === "group" && activity.contextType !== "group") return false;
    if (filters?.context === "public" && !activity.contextType.startsWith("public")) return false;
    if (filters?.status && filters.status !== "all" && activity.status !== filters.status) return false;
    if (filters?.action === "created-by-me" && activity.created_by !== userId) return false;
    if (filters?.action === "needs-response" && !activity.needsResponse) return false;
    if (filters?.action === "pending-requests" && activity.pendingRequests === 0) return false;
    if (filters?.action === "completed" && activity.status !== "completed") return false;

    if (filters?.tab === "upcoming" && activity.status !== "scheduled") return false;
    if (filters?.tab === "decision" && activity.status !== "draft" && activity.status !== "planning" && !activity.hasOpenPoll) return false;
    if (filters?.tab === "personal" && activity.contextType !== "personal") return false;
    if (filters?.tab === "group" && activity.contextType !== "group") return false;
    if (filters?.tab === "public" && !activity.contextType.startsWith("public")) return false;
    if (filters?.tab === "completed" && activity.status !== "completed") return false;
    if (filters?.tab === "archived" && activity.status !== "cancelled") return false;

    return true;
  });
}

export async function listActivityOverview(userId: string, filters?: ActivityListFilters) {
  const supabase = await createClient();
  const [{ data: activities, error }, { data: participantRows }] = await Promise.all([
    supabase.from("activities").select("*").order("starts_at", { ascending: true, nullsFirst: false }),
    supabase.from("activity_participants").select("activity_id").eq("user_id", userId)
  ]);

  if (error) throw error;

  const participantActivityIds = new Set((participantRows ?? []).map((row) => row.activity_id));
  const visibleActivities = ((activities ?? []) as Activity[]).filter(
    (activity) => activity.created_by === userId || activity.group_id || participantActivityIds.has(activity.id)
  );
  const activityIds = visibleActivities.map((activity) => activity.id);
  const groupIds = Array.from(new Set(visibleActivities.map((activity) => activity.group_id).filter((id): id is string => Boolean(id))));

  const [{ data: groups }, { data: participants }, { data: invitations }, { data: polls }] = activityIds.length
    ? await Promise.all([
        groupIds.length ? supabase.from("groups").select("id, name").in("id", groupIds) : Promise.resolve({ data: [] }),
        supabase.from("activity_participants").select("*").in("activity_id", activityIds),
        supabase.from("invitations").select("*").in("activity_id", activityIds).eq("status", "pending"),
        supabase.from("polls").select("*").in("activity_id", activityIds).eq("status", "open")
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }];

  const groupsById = new Map(((groups ?? []) as Pick<Group, "id" | "name">[]).map((group) => [group.id, group.name]));
  const participantList = (participants ?? []) as ActivityParticipant[];
  const invitationList = (invitations ?? []) as Invitation[];
  const openPollList = (polls ?? []) as Poll[];

  const enriched = visibleActivities.map((activity): ActivityListItem => {
    const activityParticipants = participantList.filter((participant) => participant.activity_id === activity.id);
    const pendingInvitations = invitationList.filter((invitation) => invitation.activity_id === activity.id).length;
    const groupName = activity.group_id ? groupsById.get(activity.group_id) ?? "Gruppo" : null;
    const contextType: ActivityListItem["contextType"] = activity.group_id ? "group" : "personal";
    const openPollsCount = openPollList.filter((poll) => poll.activity_id === activity.id).length;

    return {
      ...activity,
      contextLabel: groupName ? `Gruppo: ${groupName}` : "Personale",
      contextType,
      groupName,
      participantCounts: {
        confirmed: activityParticipants.filter((participant) => participant.status === "confirmed").length,
        maybe: activityParticipants.filter((participant) => participant.status === "maybe").length,
        pending: activityParticipants.filter((participant) => participant.status === "invited").length + pendingInvitations,
        declined: activityParticipants.filter((participant) => participant.status === "declined").length
      },
      pendingInvitations,
      openPollsCount,
      hasOpenPoll: openPollsCount > 0,
      needsResponse: activityParticipants.some((participant) => participant.user_id === userId && participant.status === "invited"),
      pendingRequests: 0
    };
  });

  return sortActivityList(filterActivityList(enriched, userId, filters), filters?.sort);
}

export async function listActivities(groupId: string, filters?: ActivityFilters) {
  return listGroupActivities(groupId, filters);
}

export async function enrichGroupsForList(groups: Array<Group & { role: string }>): Promise<GroupListItem[]> {
  if (!groups.length) return [];

  const supabase = await createClient();
  const groupIds = groups.map((group) => group.id);
  const [{ data: members, error: membersError }, { data: activities, error: activitiesError }] = await Promise.all([
    supabase.from("group_members").select("group_id").in("group_id", groupIds),
    supabase.from("activities").select("id, group_id").in("group_id", groupIds)
  ]);

  const memberCounts = new Map<string, number>();
  const activityCounts = new Map<string, number>();

  if (!membersError) {
    (members ?? []).forEach((member) => {
      if (member.group_id) memberCounts.set(member.group_id, (memberCounts.get(member.group_id) ?? 0) + 1);
    });
  }

  if (!activitiesError) {
    (activities ?? []).forEach((activity) => {
      if (activity.group_id) activityCounts.set(activity.group_id, (activityCounts.get(activity.group_id) ?? 0) + 1);
    });
  }

  return groups.map((group) => ({
    ...group,
    memberCount: membersError ? 1 : memberCounts.get(group.id) ?? 0,
    activityCount: activitiesError ? null : activityCounts.get(group.id) ?? 0
  }));
}

export async function listGroupPhotoCollection(groupId: string): Promise<GroupPhotoItem[]> {
  const supabase = await createClient();
  const activities = await listGroupActivities(groupId);
  const activityIds = activities.map((activity) => activity.id);
  if (!activityIds.length) return [];

  const { data: photos, error } = await supabase.from("activity_photos").select("*").in("activity_id", activityIds).order("created_at", { ascending: false });
  if (error) throw error;

  const activitiesById = new Map(activities.map((activity) => [activity.id, activity]));
  const signedPhotos = await Promise.all(
    ((photos ?? []) as ActivityPhoto[]).map(async (photo) => {
      const { data } = await supabase.storage.from("activity-photos").createSignedUrl(photo.storage_path, 60 * 10);
      const activity = activitiesById.get(photo.activity_id);

      return {
        ...photo,
        signedUrl: data?.signedUrl,
        activityTitle: activity?.title ?? "Ritrovo",
        activityStartsAt: activity?.starts_at ?? null
      };
    })
  );

  return signedPhotos;
}

async function getActivitySummary(activities: Activity[]) {
  const upcoming = activities
    .filter((activity) => ["draft", "planning", "scheduled"].includes(activity.status))
    .sort((a, b) => {
      if (!a.starts_at && !b.starts_at) return a.updated_at.localeCompare(b.updated_at);
      if (!a.starts_at) return 1;
      if (!b.starts_at) return -1;
      return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
    })
    .slice(0, 6);
  const past = activities.filter((activity) => activity.status === "completed").slice(0, 6);
  const activityIds = activities.map((activity) => activity.id);

  const supabase = await createClient();
  const [{ data: polls }, { data: availability }, { data: participants }, { data: invitations }, { data: photos }] = activityIds.length
    ? await Promise.all([
        supabase.from("polls").select("*").in("activity_id", activityIds).eq("status", "open").limit(12),
        supabase.from("availability_options").select("*").in("activity_id", activityIds).limit(20),
        supabase.from("activity_participants").select("*").in("activity_id", activityIds),
        supabase.from("invitations").select("*").in("activity_id", activityIds).eq("status", "pending").order("created_at", { ascending: false }),
        supabase.from("activity_photos").select("*").in("activity_id", activityIds)
      ])
    : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }];

  return {
    activities,
    upcoming,
    past,
    openPolls: (polls ?? []) as Poll[],
    availability: (availability ?? []) as AvailabilityOption[],
    participants: (participants ?? []) as ActivityParticipant[],
    invitations: (invitations ?? []) as Invitation[],
    photos: (photos ?? []) as ActivityPhoto[]
  };
}

export async function getDashboardData(userId: string) {
  const activities = await listMyActivities(userId);
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

  const normalizedActivity = activity as Activity;
  const [{ data: group }, { data: creator }, { data: participants }, { data: photos }, { data: options }, { data: responses }, { data: polls }, { data: pollOptions }, { data: votes }, { data: invitations }] =
    await Promise.all([
      normalizedActivity.group_id ? supabase.from("groups").select("*").eq("id", normalizedActivity.group_id).single() : Promise.resolve({ data: null }),
      normalizedActivity.created_by ? supabase.from("profiles").select("*").eq("id", normalizedActivity.created_by).single() : Promise.resolve({ data: null }),
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
    activity: normalizedActivity,
    group: group as Group | null,
    organizer: creator as Profile | null,
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
