import Image from "next/image";
import { CalendarClock, MapPin, ShieldCheck, UserRound, UsersRound, Wallet } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrencyRange } from "@/lib/utils";
import type { Activity } from "@/lib/database.types";

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

export function ActivityDetailHeader({
  activity,
  groupName,
  organizerName,
  privacyLabel,
  privacyHint,
  operationalStatus,
  primaryCtaHref,
  primaryCtaLabel,
  coverPhotoUrl
}: {
  activity: Activity;
  groupName?: string | null;
  organizerName: string;
  privacyLabel: string;
  privacyHint: string;
  operationalStatus: string;
  primaryCtaHref: string;
  primaryCtaLabel: string;
  coverPhotoUrl?: string | null;
}) {
  const when = activity.starts_at ? format(new Date(activity.starts_at), "d MMM yyyy, HH:mm", { locale: it }) : "Data da definire";
  const contextLabel = groupName ? `Gruppo: ${groupName}` : "Personale";

  return (
    <Card className="overflow-hidden bg-white/86 p-0">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap gap-2">
            <Badge className={statusTone[activity.status]}>{operationalStatus || statusLabel[activity.status]}</Badge>
            <Badge>{contextLabel}</Badge>
            <Badge>{privacyLabel}</Badge>
            <Badge>{activity.category}</Badge>
            {activity.ai_generated ? <Badge className="border-accent/30 bg-accent/10 text-accent">AI</Badge> : null}
          </div>

          <div className="mt-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="max-w-4xl text-2xl font-semibold leading-tight sm:text-4xl">{activity.title}</h1>
              <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">{activity.description || "Descrizione da completare."}</p>
            </div>
            <Button asChild href={primaryCtaHref} className="w-full shrink-0 sm:w-auto">
              {primaryCtaLabel}
            </Button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <p className="flex items-start gap-2 rounded-xl bg-muted/70 p-3 text-sm">
              <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                <span className="block text-xs text-muted-foreground">Data e ora</span>
                {when}
              </span>
            </p>
            <p className="flex items-start gap-2 rounded-xl bg-muted/70 p-3 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                <span className="block text-xs text-muted-foreground">Luogo</span>
                {activity.location_name || "Luogo da definire"}
              </span>
            </p>
            <p className="flex items-start gap-2 rounded-xl bg-muted/70 p-3 text-sm">
              <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                <span className="block text-xs text-muted-foreground">Budget stimato</span>
                {formatCurrencyRange(activity.budget_min, activity.budget_max)}
              </span>
            </p>
            <p className="flex items-start gap-2 rounded-xl bg-muted/70 p-3 text-sm">
              <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                <span className="block text-xs text-muted-foreground">Organizzatore</span>
                {organizerName}
              </span>
            </p>
          </div>

          <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            {privacyHint}
          </p>
        </div>

        <div className="relative min-h-56 overflow-hidden bg-muted lg:min-h-full">
          {coverPhotoUrl ? (
            <Image src={coverPhotoUrl} alt={`Copertina di ${activity.title}`} fill sizes="(min-width: 1024px) 20rem, 100vw" className="object-cover" priority />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.28),transparent_34%),linear-gradient(135deg,#f8fafc,#dbeafe_52%,#dcfce7)]" />
          )}
          <div className="relative flex h-full min-h-56 p-5 lg:min-h-full">
            <div className="flex h-full min-h-48 w-full flex-col justify-between rounded-2xl border border-white/70 bg-white/72 p-4 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <Badge className="bg-white">{coverPhotoUrl ? "Anteprima foto" : "Copertina"}</Badge>
                <UsersRound className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">{activity.category}</p>
                <p className="mt-2 text-xl font-semibold leading-tight">{activity.title}</p>
                <p className="mt-2 text-sm leading-5 text-muted-foreground">{groupName || "Ritrovo personale"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
