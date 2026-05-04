import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarClock, Camera, Settings, UsersRound } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { ActivityCard } from "@/components/activity-card";
import { inviteMemberAction } from "@/app/(app)/actions";
import { CopyInviteLinks } from "@/components/copy-invite-links";
import { GroupSettingsForm, InviteMemberForm, MembersList } from "@/components/group-settings-form";
import { EmptyState } from "@/components/states";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getGroupDashboardData, getGroupSettings, listActivityOverview, listGroupActivities, listGroupPhotoCollection } from "@/lib/data";
import { normalizeGroupRole } from "@/lib/utils";
import { getCurrentWorkspace } from "@/lib/workspace";

function formatActivityDate(value?: string | null) {
  return value ? format(new Date(value), "d MMM yyyy, HH:mm", { locale: it }) : "Data da definire";
}

function memberSummary(members: Awaited<ReturnType<typeof getGroupSettings>>["members"]) {
  if (!members.length) return "Nessun membro visibile";

  const visibleMembers = members.slice(0, 6).map((member) => `${member.profiles?.full_name || "Membro senza nome"} - ${normalizeGroupRole(member.role)}`);
  const remaining = members.length - visibleMembers.length;
  return `${visibleMembers.join("; ")}${remaining > 0 ? `; + altri ${remaining}` : ""}`;
}

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workspace = await getCurrentWorkspace();
  const group = workspace.groups.find((item) => item.id === id);
  if (!group) notFound();

  const canManageGroup = ["owner", "admin"].includes(group.role);
  const [data, activities, overviewActivities, settings, photos] = await Promise.all([
    getGroupDashboardData(group.id),
    listGroupActivities(group.id),
    listActivityOverview(workspace.user.id, { group: group.id }),
    getGroupSettings(group.id),
    listGroupPhotoCollection(group.id)
  ]);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const membersText = memberSummary(settings.members);

  return (
    <>
      <PageHeader
        title={group.name}
        subtitle={group.description ?? "Spazio ricorrente con membri, ritrovi, note e memoria del gruppo."}
        action={
          <div className="flex gap-2">
            {canManageGroup ? (
              <Button asChild variant="outline" size="icon">
                <Link href="#impostazioni-gruppo" aria-label="Impostazioni gruppo" title="Impostazioni gruppo">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
            ) : null}
            <Button asChild href={`/nuova-attivita?group_id=${group.id}`}>Nuovo ritrovo</Button>
          </div>
        }
        breadcrumbs={[{ label: "Gruppi", href: "/gruppi" }, { label: group.name }]}
      />
      <Card className="mb-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
            <UsersRound className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium">Membri</p>
            <p className="mt-1 truncate text-sm leading-6 text-muted-foreground" title={membersText}>{membersText}</p>
          </div>
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><p className="text-sm text-muted-foreground">Membri</p><p className="mt-2 text-3xl font-semibold">{settings.members.length}</p></Card>
        <Card><p className="text-sm text-muted-foreground">Ritrovi totali</p><p className="mt-2 text-3xl font-semibold">{activities.length}</p></Card>
        <Card><p className="text-sm text-muted-foreground">Prossimi</p><p className="mt-2 text-3xl font-semibold">{data.upcoming.length}</p></Card>
      </div>
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Ritrovi del gruppo</h2>
          <Link className="text-sm font-medium text-primary" href={`/attivita?group=${group.id}`}>Vista aggregata</Link>
        </div>
        {overviewActivities.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{overviewActivities.map((activity) => <ActivityCard key={activity.id} activity={activity} />)}</div>
        ) : (
          <EmptyState title="Nessun ritrovo nel gruppo" message="Questo gruppo non ha ancora ritrovi." actionHref={`/nuova-attivita?group_id=${group.id}`} actionLabel="Nuovo ritrovo" />
        )}
      </section>
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Foto del gruppo</h2>
          {activities.length ? <Link className="text-sm font-medium text-primary" href={`/attivita?group=${group.id}`}>Vai ai ritrovi del gruppo</Link> : null}
        </div>
        {photos.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {photos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden p-0">
                <Link href={`/attivita/${photo.activity_id}`} className="block bg-muted">
                  {photo.signedUrl ? (
                    <Image src={photo.signedUrl} alt={photo.caption || "Foto ritrovo"} width={800} height={600} className="aspect-[4/3] w-full object-cover" />
                  ) : (
                    <div className="flex aspect-[4/3] items-center justify-center bg-muted text-muted-foreground">
                      <Camera className="h-6 w-6" />
                    </div>
                  )}
                </Link>
                <figcaption className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-2 text-sm font-medium">{photo.caption || photo.activityTitle}</p>
                    <Badge className="shrink-0">Foto</Badge>
                  </div>
                  <Link href={`/attivita/${photo.activity_id}`} className="mt-2 block truncate text-sm font-medium text-primary">{photo.activityTitle}</Link>
                  <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <CalendarClock className="h-3.5 w-3.5 shrink-0 text-primary" />
                    {formatActivityDate(photo.activityStartsAt)}
                  </p>
                  {photo.uploadedByName ? <p className="mt-1 truncate text-xs text-muted-foreground">Caricata da {photo.uploadedByName}</p> : null}
                </figcaption>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title="Raccolta foto vuota" message="Non ci sono ancora foto per questo gruppo. Le foto caricate nei singoli ritrovi appariranno qui." actionHref={activities.length ? `/attivita?group=${group.id}` : undefined} actionLabel={activities.length ? "Vai ai ritrovi del gruppo" : undefined} />
        )}
      </section>
      <section id="impostazioni-gruppo" className="mt-8 scroll-mt-24">
        <h2 className="mb-4 text-xl font-semibold">Impostazioni gruppo</h2>
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          {canManageGroup ? (
            <>
              <GroupSettingsForm group={settings.group} />
              <InviteMemberForm action={inviteMemberAction} groupId={settings.group.id} />
              <Card className="xl:col-span-2">
                <h2 className="font-semibold">Link invito da condividere</h2>
                <div className="mt-4">
                  <CopyInviteLinks invitations={settings.invitations} baseUrl={baseUrl} />
                </div>
              </Card>
            </>
          ) : null}
          <div className="xl:col-span-2">
            <MembersList members={settings.members} />
          </div>
        </div>
      </section>
    </>
  );
}
