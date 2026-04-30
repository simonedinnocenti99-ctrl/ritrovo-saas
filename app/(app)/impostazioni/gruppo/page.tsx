import { inviteMemberAction } from "@/app/(app)/actions";
import { GroupSettingsForm, InviteMemberForm, MembersList } from "@/components/group-settings-form";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/states";
import { getGroupSettings } from "@/lib/data";
import { getCurrentWorkspace } from "@/lib/workspace";

export default async function GroupSettingsPage() {
  const workspace = await getCurrentWorkspace();
  const currentGroup = workspace.groups[0];

  if (!currentGroup) {
    return (
      <>
        <PageHeader title="Impostazioni gruppo" subtitle="Crea un gruppo per gestire membri ricorrenti, inviti e ritrovi dedicati." />
        <EmptyState title="Nessun gruppo" message="Puoi continuare a creare ritrovi personali oppure creare un gruppo quando ti serve un pubblico ricorrente." actionHref="/gruppi" actionLabel="Vai ai gruppi" />
      </>
    );
  }

  const settings = await getGroupSettings(currentGroup.id);

  return (
    <>
      <PageHeader title="Impostazioni gruppo" subtitle="Gestisci nome, descrizione, inviti e ruoli del gruppo corrente." />
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <GroupSettingsForm group={settings.group} />
        <InviteMemberForm action={inviteMemberAction} groupId={settings.group.id} />
        <div className="xl:col-span-2">
          <MembersList members={settings.members} />
        </div>
      </div>
    </>
  );
}
