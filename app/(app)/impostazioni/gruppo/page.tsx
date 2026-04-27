import { inviteMemberAction } from "@/app/(app)/actions";
import { GroupSettingsForm, InviteMemberForm, MembersList } from "@/components/group-settings-form";
import { PageHeader } from "@/components/page-header";
import { getGroupSettings } from "@/lib/data";
import { getCurrentWorkspace } from "@/lib/workspace";

export default async function GroupSettingsPage() {
  const workspace = await getCurrentWorkspace();
  const settings = await getGroupSettings(workspace.group.id);

  return (
    <>
      <PageHeader title="Impostazioni gruppo" subtitle="Gestisci nome, descrizione, inviti e ruoli del gruppo corrente." />
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <GroupSettingsForm group={settings.group} />
        <InviteMemberForm action={inviteMemberAction} />
        <div className="xl:col-span-2">
          <MembersList members={settings.members} />
        </div>
      </div>
    </>
  );
}
