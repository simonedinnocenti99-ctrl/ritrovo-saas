import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrencyRange } from "@/lib/utils";
import type { Activity } from "@/lib/database.types";

const statusLabel: Record<Activity["status"], string> = {
  draft: "Bozza",
  planning: "In pianificazione",
  scheduled: "Programmato",
  completed: "Completato",
  cancelled: "Annullato"
};

export function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <Link href={`/attivita/${activity.id}`} className="block">
      <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <Badge>{statusLabel[activity.status]}</Badge>
          <Badge className="text-primary">{activity.category}</Badge>
        </div>
        <h2 className="mt-4 text-lg font-semibold">{activity.title}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{activity.description || "Nessuna descrizione inserita."}</p>
        <div className="mt-5 space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {activity.starts_at ? format(new Date(activity.starts_at), "d MMM yyyy, HH:mm", { locale: it }) : "Data da definire"}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {activity.location_name || "Luogo da definire"}
          </p>
        </div>
        <p className="mt-4 text-sm font-medium text-primary">{formatCurrencyRange(activity.budget_min, activity.budget_max)}</p>
      </Card>
    </Link>
  );
}
