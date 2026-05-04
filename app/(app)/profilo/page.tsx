import { PageHeader } from "@/components/page-header";
import { ProfileForm } from "@/components/profile-form";
import { getCurrentWorkspace } from "@/lib/workspace";

export default async function ProfilePage() {
  const workspace = await getCurrentWorkspace();

  return (
    <>
      <PageHeader
        title="Profilo"
        subtitle="Gestisci identita, dati account e preferenze usate nei gruppi, nei ritrovi e nei profili pubblici futuri."
      />

      <ProfileForm
        displayName={workspace.profile?.full_name}
        email={workspace.user.email}
        avatarUrl={workspace.profile?.avatar_url}
      />
    </>
  );
}
