import Image from "next/image";
import Link from "next/link";
import { Archive, CalendarClock, Camera, MapPin, NotebookText, UsersRound, Wallet } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { EmptyState } from "@/components/states";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getArchiveData, type ArchiveActivityItem, type ArchivePhotoItem } from "@/lib/data";
import type { Activity } from "@/lib/database.types";
import { formatCurrencyRange } from "@/lib/utils";
import { getCurrentWorkspace } from "@/lib/workspace";

const statusLabel: Record<Activity["status"], string> = {
  draft: "Bozza",
  planning: "Da confermare",
  scheduled: "Programmato",
  completed: "Completato",
  cancelled: "Archiviato"
};

const statusTone: Record<Activity["status"], string> = {
  draft: "border-slate-300 bg-slate-50 text-slate-700",
  planning: "border-amber-300 bg-amber-50 text-amber-800",
  scheduled: "border-emerald-300 bg-emerald-50 text-emerald-800",
  completed: "border-blue-300 bg-blue-50 text-blue-800",
  cancelled: "border-zinc-300 bg-zinc-50 text-zinc-700"
};

function formatActivityDate(value?: string | null) {
  return value ? format(new Date(value), "d MMM yyyy, HH:mm", { locale: it }) : "Data da definire";
}

function monthLabel(activity: ArchiveActivityItem) {
  const value = activity.starts_at ?? activity.updated_at;
  return format(new Date(value), "MMMM yyyy", { locale: it });
}

function activityCost(activity: ArchiveActivityItem) {
  if (!activity.budget_min && !activity.budget_max) return "Budget non indicato";
  return activity.budget_min === 0 && activity.budget_max === 0 ? "Gratuito" : formatCurrencyRange(activity.budget_min, activity.budget_max);
}

function StatCard({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <Card className="h-full">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{hint}</p>
    </Card>
  );
}

function PhotoPreview({ activity }: { activity: ArchiveActivityItem }) {
  if (!activity.photos.length) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed bg-muted/40 text-center text-xs leading-5 text-muted-foreground">
        Le foto caricate nei ritrovi conclusi appariranno qui.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {activity.photos.map((photo) => (
        <div key={photo.id} className="overflow-hidden rounded-xl border bg-muted">
          {photo.signedUrl ? (
            <Image src={photo.signedUrl} alt={photo.caption || `Foto di ${activity.title}`} width={320} height={240} className="aspect-[4/3] w-full object-cover" />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center text-muted-foreground">
              <Camera className="h-4 w-4" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ArchiveActivityCard({ activity }: { activity: ArchiveActivityItem }) {
  return (
    <Card className="h-full">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <Badge className={statusTone[activity.status]}>{statusLabel[activity.status]}</Badge>
            <Badge>{activity.groupName ? "Memoria del gruppo" : "Personale"}</Badge>
          </div>
          <h2 className="mt-3 text-lg font-semibold leading-6">
            <Link href={`/attivita/${activity.id}`} className="rounded-md hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30">
              {activity.title}
            </Link>
          </h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{activity.description || "Descrizione non presente."}</p>
        </div>
        <Badge>{activity.category}</Badge>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[11rem_1fr]">
        <PhotoPreview activity={activity} />
        <div className="grid gap-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 shrink-0 text-primary" />
            {formatActivityDate(activity.starts_at)}
          </p>
          <p className="flex items-center gap-2">
            <UsersRound className="h-4 w-4 shrink-0 text-primary" />
            {activity.group_id && activity.groupName ? (
              <Link href={`/gruppi/${activity.group_id}`} className="font-medium text-primary hover:underline">
                {activity.groupName}
              </Link>
            ) : (
              "Personale"
            )}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-primary" />
            {activity.location_name || "Luogo non indicato"}
          </p>
          <p className="flex items-center gap-2">
            <Wallet className="h-4 w-4 shrink-0 text-primary" />
            {activityCost(activity)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-muted/60 p-3">
          <p className="text-sm font-semibold text-foreground">{activity.participantCounts.confirmed}</p>
          <p className="text-xs text-muted-foreground">Partecipanti confermati</p>
          {activity.confirmedParticipants.length ? <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{activity.confirmedParticipants.slice(0, 4).join(", ")}</p> : null}
        </div>
        <div className="rounded-xl bg-muted/60 p-3">
          <p className="text-sm font-semibold text-foreground">{activity.photos.length ? `${activity.photos.length} anteprime` : "Album vuoto"}</p>
          <p className="text-xs text-muted-foreground">Foto del ritrovo</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border bg-white/70 p-3 text-sm leading-6 text-muted-foreground">
        <p className="flex items-start gap-2">
          <NotebookText className="mt-1 h-4 w-4 shrink-0 text-primary" />
          <span>
            <span className="font-medium text-foreground">{activity.notePreview ? "Note salvate" : "Nessuna nota"}</span>
            {activity.notePreview ? `: ${activity.notePreview}` : ". Le note del ritrovo appariranno qui quando saranno aggiunte nel dettaglio."}
          </span>
        </p>
      </div>

      {activity.groupName ? <p className="mt-3 text-sm text-muted-foreground">Salvato nella memoria del gruppo.</p> : null}

      <Button asChild href={`/attivita/${activity.id}`} variant="secondary" className="mt-5 w-full sm:w-auto">
        Vedi dettagli
      </Button>
    </Card>
  );
}

function RecentPhotoCard({ photo }: { photo: ArchivePhotoItem }) {
  return (
    <Card className="overflow-hidden p-0">
      <Link href={`/attivita/${photo.activity_id}`} className="block bg-muted">
        {photo.signedUrl ? (
          <Image src={photo.signedUrl} alt={photo.caption || `Foto di ${photo.activityTitle}`} width={640} height={480} className="aspect-[4/3] w-full object-cover" />
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center bg-muted text-muted-foreground">
            <Camera className="h-6 w-6" />
          </div>
        )}
      </Link>
      <figcaption className="p-4">
        <p className="line-clamp-2 text-sm font-medium">{photo.caption || photo.activityTitle}</p>
        <Link href={`/attivita/${photo.activity_id}`} className="mt-2 block truncate text-sm font-medium text-primary">
          {photo.activityTitle}
        </Link>
        <p className="mt-1 text-xs text-muted-foreground">{photo.groupName || "Personale"} - {formatActivityDate(photo.activityStartsAt)}</p>
        {photo.uploadedByName ? <p className="mt-1 truncate text-xs text-muted-foreground">Caricata da {photo.uploadedByName}</p> : null}
      </figcaption>
    </Card>
  );
}

export default async function ArchivePage() {
  const workspace = await getCurrentWorkspace();
  const data = await getArchiveData(workspace.user.id);
  const groupedActivities = data.activities.reduce<Array<{ label: string; activities: ArchiveActivityItem[] }>>((groups, activity) => {
    const label = monthLabel(activity);
    const existing = groups.find((group) => group.label === label);
    if (existing) existing.activities.push(activity);
    else groups.push({ label, activities: [activity] });
    return groups;
  }, []);

  return (
    <>
      <PageHeader
        title="Archivio attivita"
        subtitle="Ritrova le attivita concluse, le foto, le note e i ricordi dei tuoi gruppi."
        action={<Button asChild href="/attivita?tab=completed" variant="secondary">Vai ai ritrovi completati</Button>}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Attivita archiviate" value={data.stats.archivedCount} hint="Ritrovi completati o archiviati visibili nel tuo spazio." />
        <StatCard label="Gruppi coinvolti" value={data.stats.groupsCount} hint="Gruppi con almeno un ritrovo nella memoria." />
        <StatCard label="Foto salvate" value={data.stats.photosCount} hint="Foto gia collegate ai ritrovi conclusi, senza duplicarle." />
        <StatCard label="Ultimo ritrovo" value={data.stats.lastArchived?.title ?? "-"} hint={data.stats.lastArchived ? formatActivityDate(data.stats.lastArchived.starts_at) : "Nessuna attivita conclusa."} />
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <main className="space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <div className="flex items-start gap-3">
              <Archive className="mt-1 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h2 className="font-semibold">Memoria organizzata dei ritrovi</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  L&apos;archivio raccoglie i ritrovi conclusi e conserva tutto cio che e utile ricordare: partecipanti, foto, note, luoghi e dettagli.
                </p>
              </div>
            </div>
          </Card>

          {groupedActivities.length ? (
            <div className="space-y-6">
              {groupedActivities.map((group) => (
                <section key={group.label} className="grid gap-4 lg:grid-cols-[8rem_1fr]">
                  <h2 className="pt-1 text-sm font-semibold capitalize text-primary">{group.label}</h2>
                  <div className="space-y-4">
                    {group.activities.map((activity) => <ArchiveActivityCard key={activity.id} activity={activity} />)}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Non ci sono ancora attivita archiviate"
              message="Quando un ritrovo sara concluso, potrai ritrovarlo qui con foto, note e dettagli utili."
              actionHref="/attivita"
              actionLabel="Vai ai ritrovi"
            />
          )}
        </main>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ricordi recenti</CardTitle>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Foto e note restano collegate al ritrovo di origine.</p>
            </CardHeader>
            <div className="space-y-3 text-sm leading-6 text-muted-foreground">
              <p className="flex gap-3">
                <Camera className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Le foto caricate nei ritrovi conclusi appariranno qui.
              </p>
              <p className="flex gap-3">
                <NotebookText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Le note salvate nel dettaglio del ritrovo restano leggibili nell&apos;archivio.
              </p>
              <p className="flex gap-3">
                <UsersRound className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                I partecipanti mostrati sono quelli confermati, non una presenza effettiva separata.
              </p>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Foto recenti</CardTitle>
            </CardHeader>
            {data.recentPhotos.length ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                {data.recentPhotos.map((photo) => <RecentPhotoCard key={photo.id} photo={photo} />)}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed bg-muted/30 p-5 text-sm leading-6 text-muted-foreground">
                Le foto caricate nei ritrovi conclusi appariranno qui.
              </div>
            )}
          </Card>
        </aside>
      </div>
    </>
  );
}
