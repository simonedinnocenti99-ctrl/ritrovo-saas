import Link from "next/link";
import {
  Archive,
  ArrowRight,
  CalendarClock,
  Camera,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Clock3,
  MapPin,
  MessageCircleQuestion,
  Sparkles,
  UserPlus,
  UsersRound,
  Wallet
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/states";
import { PageHeader } from "@/components/page-header";
import { getDashboardData } from "@/lib/data";
import type { Activity, ActivityParticipant, Group, Invitation, Poll } from "@/lib/database.types";
import { formatCurrencyRange } from "@/lib/utils";
import { getCurrentWorkspace } from "@/lib/workspace";

type ParticipantCounts = {
  confirmed: number;
  maybe: number;
  pending: number;
};

type DashboardAction = {
  title: string;
  description: string;
  cta: string;
  href: string;
  priority: "Alta" | "Media" | "Bassa";
};

const activityStatusLabels: Record<Activity["status"], string> = {
  draft: "Bozza",
  planning: "Da confermare",
  scheduled: "Programmato",
  completed: "Completato",
  cancelled: "Annullato"
};

function groupLabel(activity: Activity, groupsById: Map<string, Group & { role: string }>) {
  if (!activity.group_id) return "Personale";
  return groupsById.get(activity.group_id)?.name ?? "Gruppo";
}

function participantCounts(activityId: string, participants: ActivityParticipant[], invitations: Invitation[]): ParticipantCounts {
  const activityParticipants = participants.filter((participant) => participant.activity_id === activityId);
  const pendingInvitations = invitations.filter((invitation) => invitation.activity_id === activityId).length;

  return {
    confirmed: activityParticipants.filter((participant) => participant.status === "confirmed").length,
    maybe: activityParticipants.filter((participant) => participant.status === "maybe").length,
    pending: activityParticipants.filter((participant) => participant.status === "invited").length + pendingInvitations
  };
}

function operationalStatus(activity: Activity, openPolls: Poll[]) {
  if (activity.status === "planning" && openPolls.some((poll) => poll.activity_id === activity.id)) return "Sondaggio aperto";
  if (activity.status === "planning" && (!activity.starts_at || !activity.location_name)) return "Da confermare";
  return activityStatusLabels[activity.status];
}

function activityNeedsConfirmation(activity: Activity, openPolls: Poll[]) {
  return activity.status === "draft" || activity.status === "planning" || !activity.starts_at || !activity.location_name || openPolls.some((poll) => poll.activity_id === activity.id);
}

function activityHref(activityId: string) {
  return `/attivita/${activityId}`;
}

function SectionTitle({ title, actionHref, actionLabel }: { title: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      {actionHref && actionLabel ? (
        <Link className="text-sm font-medium text-primary" href={actionHref}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

function MetricCard({ label, value, hint, href }: { label: string; value: number; hint: string; href: string }) {
  return (
    <Link href={href} className="block">
      <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-soft">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-2 text-3xl font-semibold">{value}</p>
        <p className="mt-2 text-xs leading-5 text-muted-foreground">{hint}</p>
      </Card>
    </Link>
  );
}

function RequiredActionCard({ action }: { action: DashboardAction }) {
  return (
    <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold">{action.title}</h3>
          <Badge>{action.priority}</Badge>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{action.description}</p>
      </div>
      <Button asChild href={action.href} variant={action.priority === "Alta" ? "default" : "secondary"} className="shrink-0">
        {action.cta}
      </Button>
    </Card>
  );
}

function UpcomingActivityCard({
  activity,
  groupName,
  counts,
  status
}: {
  activity: Activity;
  groupName: string;
  counts: ParticipantCounts;
  status: string;
}) {
  const primaryCta = activity.status === "draft" || activity.status === "planning" ? "Gestisci" : counts.pending ? "Invita" : "Vedi dettagli";

  return (
    <Card className="h-full">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Badge>{status}</Badge>
          <h3 className="mt-3 text-lg font-semibold">{activity.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{groupName}</p>
        </div>
        <Badge>{activity.category}</Badge>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" />
          {activity.starts_at ? format(new Date(activity.starts_at), "d MMM yyyy, HH:mm", { locale: it }) : "Data da definire"}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          {activity.location_name || "Luogo da definire"}
        </p>
        <p className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          {formatCurrencyRange(activity.budget_min, activity.budget_max)}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-xl bg-muted/60 p-2">
          <p className="font-semibold text-foreground">{counts.confirmed}</p>
          <p className="text-muted-foreground">Confermati</p>
        </div>
        <div className="rounded-xl bg-muted/60 p-2">
          <p className="font-semibold text-foreground">{counts.maybe}</p>
          <p className="text-muted-foreground">Forse</p>
        </div>
        <div className="rounded-xl bg-muted/60 p-2">
          <p className="font-semibold text-foreground">{counts.pending}</p>
          <p className="text-muted-foreground">In attesa</p>
        </div>
      </div>

      <Button asChild href={activityHref(activity.id)} className="mt-5 w-full">
        {primaryCta}
      </Button>
    </Card>
  );
}

function PendingItem({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Link href={href} className="flex items-start justify-between gap-4 rounded-2xl border bg-white/72 p-4 transition hover:bg-white hover:shadow-sm">
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-primary" />
    </Link>
  );
}

function OnboardingChecklist({
  profileComplete,
  hasGroups,
  hasActivities,
  hasInvites,
  hasRsvp
}: {
  profileComplete: boolean;
  hasGroups: boolean;
  hasActivities: boolean;
  hasInvites: boolean;
  hasRsvp: boolean;
}) {
  const steps = [
    { label: "Completa il profilo", done: profileComplete, href: "/profilo", cta: "Completa", description: "Nome e identita aiutano il gruppo a riconoscerti." },
    { label: "Crea il primo gruppo", done: hasGroups, href: "/gruppi#crea-gruppo", cta: "Crea nuovo gruppo", description: "Prepara uno spazio ricorrente per le stesse persone." },
    { label: "Crea il primo ritrovo", done: hasActivities, href: "/nuova-attivita", cta: "Crea ritrovo", description: "Imposta data, luogo o sondaggio iniziale." },
    { label: "Condividi il link di invito", done: hasInvites, href: hasActivities ? "/attivita?status=future" : "/nuova-attivita", cta: "Invita", description: "Porta dentro partecipanti o membri del gruppo." },
    { label: "Raccogli il primo RSVP", done: hasRsvp, href: "/attivita?status=future", cta: "Controlla", description: "Tieni chiare conferme, forse e risposte mancanti." }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parti da qui</CardTitle>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Crea il tuo primo ritrovo e condividilo con il gruppo in pochi passaggi.</p>
      </CardHeader>
      <div className="grid gap-3">
        {steps.map((step) => {
          const Icon = step.done ? CheckCircle2 : Circle;

          return (
            <div key={step.label} className="flex flex-col gap-3 rounded-2xl border bg-white/70 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <Icon className={step.done ? "mt-0.5 h-5 w-5 shrink-0 text-primary" : "mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"} />
                <div>
                  <p className="font-medium">{step.label}</p>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground">{step.description}</p>
                </div>
              </div>
              <Button asChild href={step.href} variant={step.done ? "outline" : "secondary"} size="sm" className="shrink-0">
                {step.done ? "Fatto" : step.cta}
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default async function DashboardPage() {
  const workspace = await getCurrentWorkspace();
  const data = await getDashboardData(workspace.user.id);
  const groupsById = new Map(workspace.groups.map((group) => [group.id, group]));
  const responsesPending = data.upcoming.reduce((total, activity) => total + participantCounts(activity.id, data.participants, data.invitations).pending, 0);
  const completedWithoutMemory = data.past.filter((activity) => !data.photos.some((photo) => photo.activity_id === activity.id));
  const needsConfirmation = data.upcoming.filter((activity) => activityNeedsConfirmation(activity, data.openPolls));
  const profileComplete = Boolean(workspace.profile?.full_name?.trim());
  const hasActivities = data.activities.length > 0;
  const hasGroups = workspace.groups.length > 0;
  const hasInvites = data.invitations.length > 0 || data.participants.length > 0;
  const hasRsvp = data.participants.some((participant) => participant.status !== "invited");
  const hasAnyData = hasActivities || hasGroups;
  const firstPollActivity = data.openPolls.length ? data.activities.find((activity) => activity.id === data.openPolls[0].activity_id) : null;
  const reminderActivity = data.upcoming.find((activity) => participantCounts(activity.id, data.participants, data.invitations).pending > 0);
  const inviteActivity = data.upcoming.find((activity) => participantCounts(activity.id, data.participants, data.invitations).confirmed + participantCounts(activity.id, data.participants, data.invitations).maybe + participantCounts(activity.id, data.participants, data.invitations).pending === 0);
  const confirmActivity = needsConfirmation[0];
  const memoryActivity = completedWithoutMemory[0];

  const requiredActions: DashboardAction[] = [
    !profileComplete
      ? { title: "Completa il tuo profilo", description: "Aggiungi il nome con cui vuoi comparire nei gruppi e negli inviti.", cta: "Completa", href: "/profilo", priority: "Alta" }
      : null,
    !hasGroups
      ? { title: "Crea il tuo primo gruppo", description: "Ritrovo funziona meglio quando organizzi con uno spazio condiviso e ricorrente.", cta: "Crea nuovo gruppo", href: "/gruppi#crea-gruppo", priority: "Media" }
      : null,
    !hasActivities
      ? { title: "Crea il primo ritrovo", description: "Imposta una proposta e condividila con le persone giuste.", cta: "Crea ritrovo", href: "/nuova-attivita", priority: "Alta" }
      : null,
    firstPollActivity
      ? { title: `Chiudi il sondaggio per ${firstPollActivity.title}`, description: "Quando il gruppo ha votato, passa alla conferma di data, luogo o scelta finale.", cta: "Gestisci", href: activityHref(firstPollActivity.id), priority: "Alta" }
      : null,
    reminderActivity
      ? { title: `Invia un promemoria per ${reminderActivity.title}`, description: `${participantCounts(reminderActivity.id, data.participants, data.invitations).pending} persone sono ancora senza risposta.`, cta: "Invia reminder", href: activityHref(reminderActivity.id), priority: "Media" }
      : null,
    confirmActivity
      ? { title: "Conferma luogo e orario", description: `${confirmActivity.title} ha ancora dettagli organizzativi da fissare.`, cta: "Gestisci", href: activityHref(confirmActivity.id), priority: "Media" }
      : null,
    inviteActivity
      ? { title: "Invita partecipanti al prossimo ritrovo", description: `${inviteActivity.title} non ha ancora partecipanti collegati.`, cta: "Invita", href: activityHref(inviteActivity.id), priority: "Media" }
      : null,
    memoryActivity
      ? { title: `Aggiungi foto a ${memoryActivity.title}`, description: "Il ritrovo e concluso: puoi salvare foto e note nella memoria del gruppo.", cta: "Aggiungi foto", href: activityHref(memoryActivity.id), priority: "Bassa" }
      : null
  ].filter((action): action is DashboardAction => Boolean(action)).slice(0, 5);

  const pendingItems = [
    responsesPending
      ? { title: `${responsesPending} risposte in attesa`, description: "Partecipanti invitati o link inviati senza conferma.", href: "/attivita?status=future" }
      : null,
    data.openPolls.length
      ? { title: `${data.openPolls.length} sondaggi aperti`, description: "Decisioni ancora da chiudere prima di confermare i ritrovi.", href: firstPollActivity ? activityHref(firstPollActivity.id) : "/attivita?status=future" }
      : null,
    needsConfirmation.length
      ? { title: `${needsConfirmation.length} ritrovi da confermare`, description: "Mancano data, luogo o passaggio da bozza a programma.", href: "/attivita?status=future" }
      : null,
    data.invitations.length
      ? { title: `${data.invitations.length} inviti in attesa`, description: "Inviti creati e non ancora accettati.", href: "/attivita?status=future" }
      : null,
    completedWithoutMemory.length
      ? { title: `${completedWithoutMemory.length} attivita da completare in archivio`, description: "Aggiungi foto o note ai ritrovi gia conclusi.", href: "/archivio" }
      : null
  ].filter((item): item is { title: string; description: string; href: string } => Boolean(item));

  const suggestions = [
    data.openPolls.length && firstPollActivity ? `Hai un sondaggio aperto su ${firstPollActivity.title}. Quando emerge una scelta chiara, fissala nel dettaglio del ritrovo.` : null,
    reminderActivity ? `${reminderActivity.title} ha ancora risposte mancanti. Un promemoria ora riduce il lavoro all'ultimo minuto.` : null,
    memoryActivity ? `${memoryActivity.title} e concluso. Aggiungi foto e note mentre i ricordi sono freschi.` : null,
    hasGroups && !hasActivities ? "Hai gia un gruppo: crea un ritrovo collegato e raccogli disponibilita o RSVP." : null,
    !data.openPolls.length ? "Quando avrai sondaggi aperti, qui vedrai suggerimenti per chiuderli piu velocemente." : null
  ].filter((suggestion): suggestion is string => Boolean(suggestion)).slice(0, 3);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Il centro operativo per capire cosa fare adesso: ritrovi vicini, risposte mancanti, sondaggi aperti e prossime mosse."
        action={<Button asChild href="/nuova-attivita">Crea nuovo ritrovo</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Prossimi ritrovi" value={data.upcoming.length} hint="Bozze, ritrovi in pianificazione e programmati." href="/attivita?status=future" />
        <MetricCard label="Sondaggi aperti" value={data.openPolls.length} hint="Decisioni ancora aperte nei ritrovi." href={firstPollActivity ? activityHref(firstPollActivity.id) : "/attivita?status=future"} />
        <MetricCard label="Risposte in attesa" value={responsesPending} hint="Inviti e partecipanti non ancora confermati." href="/attivita?status=future" />
        <MetricCard label="Gruppi attivi" value={workspace.groups.length} hint="Spazi ricorrenti con cui organizzi." href="/gruppi" />
        <MetricCard label="Attivita archiviate" value={data.past.length} hint="Ritrovi conclusi da conservare o arricchire." href="/archivio" />
      </div>

      {!hasAnyData ? (
        <section className="mt-8">
          <OnboardingChecklist profileComplete={profileComplete} hasGroups={hasGroups} hasActivities={hasActivities} hasInvites={hasInvites} hasRsvp={hasRsvp} />
        </section>
      ) : null}

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section>
          <SectionTitle title="Azioni richieste" />
          {requiredActions.length ? (
            <div className="space-y-3">
              {requiredActions.map((action) => <RequiredActionCard key={`${action.title}-${action.href}`} action={action} />)}
            </div>
          ) : (
            <Card className="flex items-start gap-3">
              <ClipboardCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h3 className="font-semibold">Tutto sotto controllo</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Non ci sono azioni urgenti. Puoi creare un nuovo ritrovo o controllare i suggerimenti.</p>
              </div>
            </Card>
          )}
        </section>

        <section>
          <SectionTitle title="In sospeso" />
          {pendingItems.length ? (
            <div className="space-y-3">
              {pendingItems.map((item) => <PendingItem key={item.title} {...item} />)}
            </div>
          ) : (
            <Card className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h3 className="font-semibold">Nessun sospeso</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Risposte, sondaggi e dettagli principali risultano allineati.</p>
              </div>
            </Card>
          )}
        </section>
      </div>

      <section className="mt-8">
        <SectionTitle title="Prossimi ritrovi" actionHref="/attivita?status=future" actionLabel="Vedi tutti" />
        {data.upcoming.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.upcoming.map((activity) => (
              <UpcomingActivityCard
                key={activity.id}
                activity={activity}
                groupName={groupLabel(activity, groupsById)}
                counts={participantCounts(activity.id, data.participants, data.invitations)}
                status={operationalStatus(activity, data.openPolls)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Non hai ancora ritrovi in programma"
            message="Crea il primo ritrovo e condividilo con il tuo gruppo."
            actionHref="/nuova-attivita"
            actionLabel="Crea nuovo ritrovo"
          />
        )}
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Suggerimenti rapidi</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <p key={suggestion} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {suggestion}
              </p>
            ))}
          </div>
          <Button asChild href="/assistente" variant="secondary" className="mt-5">
            Apri suggerimenti AI
          </Button>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profilo organizzazione</CardTitle>
          </CardHeader>
          <div className="space-y-4 text-sm leading-6 text-muted-foreground">
            <p className="flex gap-3">
              <UsersRound className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {workspace.organization.name} ha {workspace.groups.length} gruppi attivi.
            </p>
            <p className="flex gap-3">
              <UserPlus className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Le richieste di partecipazione pubbliche sono predisposte nella sezione ritrovi pubblici.
            </p>
            <p className="flex gap-3">
              <MessageCircleQuestion className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Quando il backend distinguera profili azienda o organizzazione, qui compariranno richieste e ritrovi pubblicati.
            </p>
          </div>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button asChild href="/profilo" variant="secondary">
              Completa profilo
            </Button>
            <Button asChild href="/ritrovi-pubblici" variant="outline">
              Ritrovi pubblici
            </Button>
          </div>
        </Card>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Card className="flex items-start gap-3">
          <Clock3 className="mt-1 h-5 w-5 shrink-0 text-primary" />
          <div>
            <h3 className="font-semibold">Ritrovi completati</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Archivia foto, note e decisioni per ritrovarle piu avanti.</p>
          </div>
        </Card>
        <Card className="flex items-start gap-3">
          <Camera className="mt-1 h-5 w-5 shrink-0 text-primary" />
          <div>
            <h3 className="font-semibold">Foto e ricordi</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">I ritrovi conclusi mostrano upload e galleria nel dettaglio.</p>
          </div>
        </Card>
        <Card className="flex items-start gap-3">
          <Archive className="mt-1 h-5 w-5 shrink-0 text-primary" />
          <div>
            <h3 className="font-semibold">Archivio</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Lo storico resta separato dai ritrovi ancora da organizzare.</p>
          </div>
        </Card>
      </section>
    </>
  );
}
