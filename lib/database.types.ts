export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type MemberRole = "owner" | "admin" | "member" | "guest";
export type ActivityStatus = "draft" | "planning" | "scheduled" | "completed" | "cancelled";
export type ParticipantStatus = "invited" | "confirmed" | "declined" | "maybe";
export type AvailabilityStatus = "available" | "unavailable" | "maybe";
export type PollStatus = "open" | "closed";

export type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  locale: string;
  created_at: string;
  updated_at: string;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
  created_by: string | null;
  billing_plan: string;
  created_at: string;
  updated_at: string;
};

export type Group = {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Activity = {
  id: string;
  organization_id: string;
  group_id: string | null;
  created_by: string | null;
  title: string;
  description: string | null;
  category: string;
  status: ActivityStatus;
  starts_at: string | null;
  ends_at: string | null;
  location_name: string | null;
  location_address: string | null;
  budget_min: number | null;
  budget_max: number | null;
  duration: string | null;
  notes: string | null;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
};

export type ActivityParticipant = {
  id: string;
  activity_id: string;
  user_id: string | null;
  display_name: string | null;
  email: string | null;
  status: ParticipantStatus;
  invited_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ActivityPhoto = {
  id: string;
  activity_id: string;
  uploaded_by: string;
  storage_path: string;
  caption: string | null;
  created_at: string;
  signedUrl?: string;
};

export type AvailabilityOption = {
  id: string;
  activity_id: string;
  starts_at: string;
  ends_at: string;
  label: string | null;
  created_by: string | null;
  created_at: string;
};

export type AvailabilityResponse = {
  id: string;
  option_id: string;
  user_id: string;
  status: AvailabilityStatus;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type Poll = {
  id: string;
  activity_id: string;
  question: string;
  status: PollStatus;
  allow_multiple: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type PollOption = {
  id: string;
  poll_id: string;
  label: string;
  created_at: string;
};

export type PollVote = {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string;
  created_at: string;
};

export type AISuggestion = {
  title: string;
  description: string;
  reason: string;
  category: string;
  estimatedBudget: string;
  duration: string;
  bestPeriod: string;
  requirements: string[];
  pollQuestions: string[];
};
