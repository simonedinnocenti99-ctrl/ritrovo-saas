import Link from "next/link";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  Archive,
  CalendarClock,
  Camera,
  CheckCircle2,
  CircleDashed,
  Copy,
  ExternalLink,
  Link2,
  Mail,
  MapPin,
  MessageSquareText,
  Pencil,
  Plus,
  Send,
  ShieldCheck,
  UserRound,
  UsersRound,
  Wallet
} from "lucide-react";
import { createPollAction, updateRsvpAction } from "@/app/(app)/actions";
import { ActivityDetailHeader } from "@/components/activity-detail-header";
import { AvailabilityPlanner } from "@/components/availability-planner";
import { CopyInviteLinks } from "@/components/copy-invite-links";
import { PhotoGallery } from "@/components/photo-gallery";
import { PhotoUploader } from "@/components/photo-uploader";
import { PollCard } from "@/components/poll-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { getActivityDetail } from "@/lib/data";
import type { Activity, ActivityParticipant, ParticipantStatus } from "@/lib/database.types";
import { formatCurrencyRange, initials } from "@/lib/utils";
import { getCurrentWorkspace } from "@/lib/workspace";

const statusLabel: Record<Activity["status"], string> = {
  draft: "Bozza",
  planning: "Da confermare",
  scheduled: "Programmato",
  completed: "Completato",
  cancelled: "Archiviato"
};

const rsvpLabels: Record<ParticipantStatus, string> = {
  confirmed: "Confermato",
  maybe: "Forse",
  declined: "Non partecipa",
  invited: "In attesa"
};

function activityStatus(activity: Activity, openPolls: number) {
  if (openPolls > 0) return "Sondaggio aperto";
  if (activity.status === "planning" && (!activity.starts_at || !activity.location_name)) return "Da confermare";
  return statusLabel[activity.status];
}

function privacyCopy(activity: Activity, hasInvitations: boolean) {
  if (activity.group_id) {
    return {
      label: "Solo gruppo",
      hint: "Solo i membri del gruppo e gli invitati collegati possono lavorare su questo ritrovo."
    };
  }

  if (hasInvitations) {
    return {
      label: "Accessibile con link",
      hint: "Chi riceve un link di invito puo rispondere al ritrovo."
    };
  }

  return {
    label: "Personale",
    hint: "Questo ritrovo e personale finche non inviti altre persone."
  };
}

function nextAction(activity: Activity, participants: ActivityParticipant[], openPolls: number, photos: number) {
  const pending = participants.filter((participant) => participant.status === "invited").length;

  if (activity.status === "draft") {
    return { title: "Completa i dettagli del ritrovo", description: "Aggiungi data, luogo e inviti prima di condividerlo.", cta: "Completa ritrovo", href: "#informazioni" };
  }
  if (openPolls > 0) {
    return { title: "Ci sono risposte da valutare", description: "Controlla i sondaggi aperti e scegli cosa fissare.", cta: "Vedi sondaggi", href: "#sondaggi" };
  }
  if (!activity.starts_at || !activity.location_name) {
    return { title: "Mancano decisioni principali", description: "Data, ora o luogo non sono ancora confermati.", cta: "Controlla disponibilita", href: "#disponibilita" };
  }
  if (activity.status === "scheduled" && pending > 0) {
    return { title: "Invita chi non ha ancora risposto", description: `${pending} persone sono ancora in attesa di risposta.`, cta: "Copia link invito", href: "#inviti" };
  }
  if (activity.status === "completed" && photos === 0) {
    return { title: "Aggiungi foto e note per conservarlo nell'archivio", description: "Completa la memoria del ritrovo con album e dettagli utili.", cta: "Aggiungi foto", href: "#foto" };
  }
  return { title: "Ritrovo sotto controllo", description: "Risposte, dettagli principali e inviti sono visibili in questa pagina.", cta: "Gestisci partecipanti", href: "#partecipanti" };
}

function firstInviteLink(baseUrl: string, token?: string) {
  if (!token) return null;
  return `${baseUrl.replace(/\/$/, "")}/inviti/${token}`;
}

function ParticipantRow({ participant }: { participant: ActivityParticipant }) {
  const name = participant.display_name || participant.email || "Invitato";

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border bg-white/70 p-3">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{initials(name)}</div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">{participant.email || rsvpLabels[participant.status]}</p>
        </div>
      </div>
      <Badge>{rsvpLabels[participant.status]}</Badge>
    </div>
  );
}

function ParticipantGroup({ title, participants, empty }: { title: string; participants: ActivityParticipant[]; empty: string }) {
  return (
    <div className="rounded-2xl border bg-muted/30 p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        <Badge>{participants.length}</Badge>
      </div>
      <div className="space-y-2">
        {participants.map((participant) => <ParticipantRow key={participant.id} participant={participant} />)}
        {!participants.length ? <p className="rounded-xl bg-white/70 p-3 text-sm text-muted-foreground">{empty}</p> : null}
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: typeof CalendarClock; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border bg-white/70 p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm">{value}</p>
      </div>
    </div>
  );
}

function ChecklistItem({ done, label }: { done: boolean; label: string }) {
  const Icon = done ? CheckCircle2 : CircleDashed;
  return (
    <li className="flex items-center gap-3 rounded-xl border bg-white/70 p-3 text-sm">
      <Icon className={done ? "h-4 w-4 shrink-0 text-primary" : "h-4 w-4 shrink-0 text-muted-foreground"} />
      <span>{label}</span>
    </li>
  );
}

export default async function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workspace = await getCurrentWorkspace();
  const detail = await getActivityDetail(id);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const inviteLink = firstInviteLink(baseUrl, detail.invitations[0]?.token);
  const privacy = privacyCopy(detail.activity, detail.invitations.length > 0);
  const status = activityStatus(detail.activity, detail.polls.filter((poll) => poll.status === "open").length);
  const action = nextAction(detail.activity, detail.participants, detail.polls.filter((poll) => poll.status === "open").length, detail.photos.length);
  const organizerName = detail.organizer?.full_name || (detail.activity.created_by === workspace.user.id ? workspace.profile?.full_name || workspace.user.email : null) || "Organizzatore";
  const currentParticipant = detail.participants.find((participant) => participant.user_id === workspace.user.id);
  const startsAt = detail.activity.starts_at ? format(new Date(detail.activity.starts_at), "d MMM yyyy", { locale: it }) : "Data da definire";
  const startsTime = detail.activity.starts_at ? format(new Date(detail.activity.starts_at), "HH:mm", { locale: it }) : "Ora da definire";
  const endsTime = detail.activity.ends_at ? format(new Date(detail.activity.ends_at), "HH:mm", { locale: it }) : "Fine da definire";

  const confirmed = detail.participants.filter((participant) => participant.status === "confirmed");
  const maybe = detail.participants.filter((participant) => participant.status === "maybe");
  const declined = detail.participants.filter((participant) => participant.status === "declined");
  const pending = detail.participants.filter((participant) => participant.status === "invited");
  const bestPollOptions = detail.polls.map((poll) => {
    const options = detail.pollOptions.filter((option) => option.poll_id === poll.id);
    const winner = options
      .map((option) => ({ option, votes: detail.pollVotes.filter((vote) => vote.option_id === option.id).length }))
      .sort((a, b) => b.votes - a.votes)[0];
    return { pollId: poll.id, label: winner?.option.label ?? "Nessuna opzione votata", votes: winner?.votes ?? 0 };
  });

  return (
    <div className="space-y-6">
      <div className="flex max-w-full flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
        <Link href="/attivita" className="hover:text-foreground">Ritrovi</Link>
        {detail.group ? (
          <>
            <span>/</span>
            <Link href={`/gruppi/${detail.group.id}`} className="hover:text-foreground">{detail.group.name}</Link>
          </>
        ) : null}
        <span>/</span>
        <span className="truncate text-foreground">{detail.activity.title}</span>
      </div>

      <ActivityDetailHeader
        activity={detail.activity}
        groupName={detail.group?.name}
        organizerName={organizerName}
        privacyLabel={privacy.label}
        privacyHint={privacy.hint}
        operationalStatus={status}
        primaryCtaHref={action.href}
        primaryCtaLabel={action.cta}
      />

      <Card className="border-primary/25 bg-primary/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <MessageSquareText className="mt-1 h-5 w-5 shrink-0 text-primary" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">Prossima azione</h2>
                <Badge>{status}</Badge>
              </div>
              <p className="mt-2 font-medium">{action.title}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{action.description}</p>
            </div>
          </div>
          <Button asChild href={action.href} className="shrink-0">
            {action.cta}
          </Button>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <main className="space-y-6">
          <Card id="informazioni">
            <CardHeader>
              <CardTitle>Informazioni principali</CardTitle>
            </CardHeader>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoItem icon={CalendarClock} label="Data" value={startsAt} />
              <InfoItem icon={CalendarClock} label="Ora" value={`${startsTime} - ${endsTime}`} />
              <InfoItem icon={MapPin} label="Luogo" value={detail.activity.location_name || "Luogo da definire"} />
              <InfoItem icon={Wallet} label="Budget stimato" value={formatCurrencyRange(detail.activity.budget_min, detail.activity.budget_max)} />
              <InfoItem icon={UsersRound} label="Gruppo" value={detail.group?.name || "Personale"} />
              <InfoItem icon={UserRound} label="Tipo ritrovo" value={detail.activity.category} />
              <InfoItem icon={ShieldCheck} label="Privacy" value={privacy.label} />
              <InfoItem icon={Link2} label="Link utile" value={inviteLink ? "Link invito attivo" : "Nessun link invito attivo"} />
            </div>
            {detail.activity.location_address ? <p className="mt-4 text-sm leading-6 text-muted-foreground">Indirizzo: {detail.activity.location_address}</p> : null}
            {detail.activity.duration ? <p className="mt-2 text-sm leading-6 text-muted-foreground">Durata prevista: {detail.activity.duration}</p> : null}
            <p className="mt-4 text-sm leading-6 text-muted-foreground">{detail.activity.description || "Descrizione da completare."}</p>
          </Card>

          <Card id="partecipanti">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Partecipanti e RSVP</CardTitle>
                <Badge>{detail.participants.length} persone collegate</Badge>
              </div>
            </CardHeader>

            <div className="mb-5 rounded-2xl border bg-white/70 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="font-semibold">La tua risposta</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {currentParticipant ? `Stato attuale: ${rsvpLabels[currentParticipant.status]}` : "Non hai ancora risposto al ritrovo."}
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {[
                    ["confirmed", "Partecipo"],
                    ["maybe", "Forse"],
                    ["declined", "Non posso"]
                  ].map(([value, label]) => (
                    <form key={value} action={updateRsvpAction}>
                      <input type="hidden" name="activityId" value={detail.activity.id} />
                      <input type="hidden" name="status" value={value} />
                      <Button className="w-full" variant={currentParticipant?.status === value ? "default" : "outline"}>
                        {label}
                      </Button>
                    </form>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <ParticipantGroup title="Confermati" participants={confirmed} empty="Nessun partecipante confermato." />
              <ParticipantGroup title="Forse" participants={maybe} empty="Nessuna risposta forse." />
              <ParticipantGroup title="Non partecipano" participants={declined} empty="Nessun rifiuto registrato." />
              <ParticipantGroup title="In attesa" participants={pending} empty="Nessun invitato in attesa." />
            </div>

            <div className="mt-4 rounded-2xl border border-dashed bg-muted/30 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold">Richieste</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">Le richieste per ritrovi pubblici sono predisposte lato UI, ma non sono ancora collegate a database e permessi.</p>
                </div>
                <Button type="button" variant="outline" disabled>In arrivo</Button>
              </div>
            </div>
          </Card>

          <Card id="inviti">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Inviti e condivisione</CardTitle>
                <Badge>{detail.invitations.length} link in attesa</Badge>
              </div>
            </CardHeader>
            <CopyInviteLinks invitations={detail.invitations} baseUrl={baseUrl} />
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <Button asChild={Boolean(inviteLink)} href={inviteLink || undefined} variant="secondary" disabled={!inviteLink}>
                <ExternalLink className="h-4 w-4" />
                Apri link invito
              </Button>
              <Button asChild={Boolean(inviteLink)} href={inviteLink ? `https://wa.me/?text=${encodeURIComponent(inviteLink)}` : undefined} variant="outline" disabled={!inviteLink}>
                <Send className="h-4 w-4" />
                WhatsApp
              </Button>
              <Button asChild={Boolean(inviteLink)} href={inviteLink ? `mailto:?subject=${encodeURIComponent(detail.activity.title)}&body=${encodeURIComponent(inviteLink)}` : undefined} variant="outline" disabled={!inviteLink}>
                <Mail className="h-4 w-4" />
                Email
              </Button>
            </div>
            <div className="mt-4 rounded-2xl border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
              Stato link: {detail.invitations.length ? "attivo per gli inviti in attesa" : "nessun invito attivo"}. QR code, scadenza avanzata e approvazione richieste sono predisposizioni future.
            </div>
          </Card>

          <Card id="disponibilita">
            <CardHeader>
              <CardTitle>Disponibilita</CardTitle>
            </CardHeader>
            <AvailabilityPlanner activityId={detail.activity.id} options={detail.availabilityOptions} responses={detail.availabilityResponses} />
            {!detail.availabilityOptions.length ? <p className="mt-4 text-sm text-muted-foreground">Nessuna fascia proposta: aggiungi data e ora per raccogliere preferenze.</p> : null}
          </Card>

          <Card id="sondaggi">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Sondaggi</CardTitle>
                <Badge>{detail.polls.length ? `${detail.polls.length} sondaggi` : "Nessun sondaggio"}</Badge>
              </div>
            </CardHeader>
            <form action={createPollAction} className="mb-5 grid gap-3 rounded-2xl border bg-muted/35 p-4">
              <input type="hidden" name="activityId" value={detail.activity.id} />
              <Label htmlFor="question">Domanda</Label>
              <Input id="question" name="question" placeholder="Quale ristorante preferisci?" required />
              <Label htmlFor="options">Opzioni, una per riga</Label>
              <Textarea id="options" name="options" placeholder={"Trattoria centro\nPizza gourmet\nSushi"} required />
              <Button variant="secondary">
                <Plus className="h-4 w-4" />
                Crea sondaggio
              </Button>
            </form>
            <div className="space-y-4">
              {detail.polls.map((poll) => {
                const best = bestPollOptions.find((item) => item.pollId === poll.id);
                return (
                  <div key={poll.id} className="space-y-3">
                    <div className="rounded-2xl border bg-white/70 p-4 text-sm leading-6 text-muted-foreground">
                      Opzione piu votata: <span className="font-medium text-foreground">{best?.label}</span> ({best?.votes ?? 0} voti). Chi non ha ancora risposto non e tracciato dal backend attuale.
                    </div>
                    <PollCard
                      activityId={detail.activity.id}
                      poll={poll}
                      options={detail.pollOptions.filter((option) => option.poll_id === poll.id)}
                      votes={detail.pollVotes.filter((vote) => vote.poll_id === poll.id)}
                    />
                  </div>
                );
              })}
              {!detail.polls.length ? (
                <div className="rounded-2xl border bg-white/70 p-5">
                  <p className="font-medium">Non ci sono sondaggi per questo ritrovo.</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">Puoi crearne uno per data, luogo, budget o preferenze varie.</p>
                </div>
              ) : null}
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card id="note">
              <CardHeader>
                <CardTitle>Note</CardTitle>
              </CardHeader>
              <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{detail.activity.notes || "Nessuna nota condivisa per questo ritrovo."}</p>
              <div className="mt-4 rounded-2xl border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
                Note private, materiali e modifica note richiedono una action dedicata non ancora presente.
              </div>
              <Button type="button" className="mt-4" variant="outline" disabled>
                <Pencil className="h-4 w-4" />
                Modifica note
              </Button>
            </Card>

            <Card id="checklist">
              <CardHeader>
                <CardTitle>Da preparare</CardTitle>
              </CardHeader>
              <ul className="space-y-2">
                <ChecklistItem done={Boolean(detail.activity.starts_at)} label="Confermare data e ora" />
                <ChecklistItem done={Boolean(detail.activity.location_name)} label="Confermare luogo" />
                <ChecklistItem done={pending.length === 0} label="Raccogliere RSVP" />
                <ChecklistItem done={detail.invitations.length === 0} label="Inviare reminder agli invitati" />
                <ChecklistItem done={Boolean(detail.activity.notes)} label="Aggiungere note utili" />
                <ChecklistItem done={detail.activity.status !== "completed" || detail.photos.length > 0} label="Caricare foto dopo il ritrovo" />
              </ul>
            </Card>
          </div>

          <Card id="foto">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Foto</CardTitle>
                <Badge>{detail.photos.length ? `${detail.photos.length} foto` : "Album vuoto"}</Badge>
              </div>
            </CardHeader>
            <PhotoUploader activityId={detail.activity.id} />
            <div className="mt-4">
              <PhotoGallery activityId={detail.activity.id} photos={detail.photos} />
            </div>
          </Card>
        </main>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Riepilogo rapido</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="rounded-xl bg-muted/60 p-3">
                <p className="text-lg font-semibold text-foreground">{confirmed.length}</p>
                <p className="text-muted-foreground">Confermati</p>
              </div>
              <div className="rounded-xl bg-muted/60 p-3">
                <p className="text-lg font-semibold text-foreground">{maybe.length}</p>
                <p className="text-muted-foreground">Forse</p>
              </div>
              <div className="rounded-xl bg-muted/60 p-3">
                <p className="text-lg font-semibold text-foreground">{pending.length}</p>
                <p className="text-muted-foreground">In attesa</p>
              </div>
              <div className="rounded-xl bg-muted/60 p-3">
                <p className="text-lg font-semibold text-foreground">{detail.polls.filter((poll) => poll.status === "open").length}</p>
                <p className="text-muted-foreground">Sondaggi aperti</p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacy</CardTitle>
            </CardHeader>
            <Badge>{privacy.label}</Badge>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{privacy.hint}</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Pubblico con approvazione e richieste di partecipazione sono stati UI predisposti, non ancora supportati dallo schema attuale.</p>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Azioni rapide</CardTitle>
            </CardHeader>
            <div className="grid gap-2">
              <Button type="button" variant="outline" disabled>
                <Pencil className="h-4 w-4" />
                Modifica ritrovo
              </Button>
              <Button asChild href="#inviti" variant="outline">
                <Copy className="h-4 w-4" />
                Copia link invito
              </Button>
              <Button asChild href="#sondaggi" variant="outline">
                <MessageSquareText className="h-4 w-4" />
                Crea sondaggio
              </Button>
              <Button asChild href="#foto" variant="outline">
                <Camera className="h-4 w-4" />
                Aggiungi foto
              </Button>
              <Button asChild href="/nuova-attivita" variant="outline">
                <Plus className="h-4 w-4" />
                Crea ritrovo simile
              </Button>
              <Button type="button" variant="outline" disabled>
                <ExternalLink className="h-4 w-4" />
                Aggiungi al calendario
              </Button>
            </div>
            <div className="mt-5 border-t pt-4">
              <Button type="button" variant="destructive" className="w-full" disabled>
                <Archive className="h-4 w-4" />
                Archivia ritrovo
              </Button>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">Azioni distruttive disabilitate finche non esiste una conferma dedicata.</p>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
