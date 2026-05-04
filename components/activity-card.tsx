import Link from "next/link";
import Image from "next/image";
import { CalendarClock, Camera, MapPin, MessageSquareText, UserPlus, UsersRound, Wallet } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrencyRange } from "@/lib/utils";
import type { ActivityListItem } from "@/lib/data";

const statusLabel: Record<ActivityListItem["status"], string> = {
  draft: "Bozza",
  planning: "Da confermare",
  scheduled: "Programmato",
  completed: "Completato",
  cancelled: "Archiviato"
};

const statusTone: Record<ActivityListItem["status"], string> = {
  draft: "border-slate-300 bg-slate-50 text-slate-700",
  planning: "border-amber-300 bg-amber-50 text-amber-800",
  scheduled: "border-emerald-300 bg-emerald-50 text-emerald-800",
  completed: "border-blue-300 bg-blue-50 text-blue-800",
  cancelled: "border-zinc-300 bg-zinc-50 text-zinc-700"
};

function operationalStatus(activity: ActivityListItem) {
  if (activity.hasOpenPoll) return "Sondaggio aperto";
  if (activity.status === "planning" && (!activity.starts_at || !activity.location_name)) return "Da confermare";
  return statusLabel[activity.status];
}

function nextAction(activity: ActivityListItem) {
  if (activity.pendingRequests > 0) return `${activity.pendingRequests} richieste di partecipazione da approvare`;
  if (activity.hasOpenPoll) return activity.starts_at ? "Chiudi il sondaggio" : "Scegli una data";
  if (activity.participantCounts.pending > 0) return `Mancano ${activity.participantCounts.pending} risposte`;
  if (!activity.starts_at) return "Scegli data e ora";
  if (!activity.location_name) return "Aggiungi il luogo";
  if (!activity.budget_min && !activity.budget_max) return "Prezzo non ancora confermato";
  if (activity.status === "completed") return "Evento completato: aggiungi foto e note";
  if (activity.status === "draft") return "Completa la bozza e invita";
  return "Tutto pronto: controlla le risposte";
}

function primaryCta(activity: ActivityListItem) {
  if (activity.needsResponse) return "Rispondi";
  if (activity.pendingRequests > 0) return "Gestisci richieste";
  if (activity.hasOpenPoll) return "Vedi sondaggio";
  if (activity.status === "completed") return "Aggiungi foto";
  return activity.created_by ? "Gestisci" : "Vedi ritrovo";
}

function secondaryCta(activity: ActivityListItem) {
  if (activity.status === "completed") return "Vedi ricordi";
  if (activity.participantCounts.pending > 0) return "Invita";
  if (activity.status === "draft" || activity.status === "planning") return "Gestisci risposte";
  return "Invita";
}

export function ActivityCard({ activity }: { activity: ActivityListItem }) {
  const href = `/attivita/${activity.id}`;

  return (
    <Card className="flex h-full flex-col gap-5 transition hover:-translate-y-0.5 hover:shadow-soft">
      {activity.coverPhotoUrl ? (
        <Link href={href} className="-m-5 mb-0 block overflow-hidden rounded-t-2xl bg-muted">
          <Image src={activity.coverPhotoUrl} alt={`Anteprima di ${activity.title}`} width={640} height={360} className="aspect-[16/9] w-full object-cover" />
        </Link>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <Badge className={statusTone[activity.status]}>{operationalStatus(activity)}</Badge>
          {activity.contextType.startsWith("public") ? <Badge className="border-sky-300 bg-sky-50 text-sky-800">Pubblico</Badge> : null}
        </div>
        <Badge>{activity.category}</Badge>
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">{activity.contextLabel}</p>
        <h2 className="mt-2 text-lg font-semibold leading-6">
          <Link href={href} className="rounded-md hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30">
            {activity.title}
          </Link>
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{activity.description || "Descrizione da completare."}</p>
      </div>

      <div className="grid gap-2 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 shrink-0 text-primary" />
          {activity.starts_at ? format(new Date(activity.starts_at), "d MMM yyyy, HH:mm", { locale: it }) : "Data da definire"}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-primary" />
          {activity.location_name || "Luogo da definire"}
        </p>
        <p className="flex items-center gap-2">
          <Wallet className="h-4 w-4 shrink-0 text-primary" />
          {formatCurrencyRange(activity.budget_min, activity.budget_max)}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-xl bg-muted/60 p-2">
          <p className="font-semibold text-foreground">{activity.participantCounts.confirmed}</p>
          <p className="text-muted-foreground">Confermati</p>
        </div>
        <div className="rounded-xl bg-muted/60 p-2">
          <p className="font-semibold text-foreground">{activity.participantCounts.maybe}</p>
          <p className="text-muted-foreground">Forse</p>
        </div>
        <div className="rounded-xl bg-muted/60 p-2">
          <p className="font-semibold text-foreground">{activity.participantCounts.pending}</p>
          <p className="text-muted-foreground">In attesa</p>
        </div>
      </div>

      <div className="mt-auto rounded-xl border bg-white/70 p-3 text-sm">
        <p className="flex items-start gap-2 font-medium">
          <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          {nextAction(activity)}
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild href={href} className="w-full">
          {primaryCta(activity)}
        </Button>
        <Button asChild href={href} variant="outline" className="w-full">
          {activity.status === "completed" ? <Camera className="h-4 w-4" /> : activity.contextType === "group" ? <UsersRound className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
          {secondaryCta(activity)}
        </Button>
      </div>
    </Card>
  );
}
