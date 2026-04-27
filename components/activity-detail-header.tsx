import { Calendar, MapPin, Wallet } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatCurrencyRange } from "@/lib/utils";
import type { Activity } from "@/lib/database.types";

export function ActivityDetailHeader({ activity }: { activity: Activity }) {
  return (
    <Card className="bg-white/86">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <Badge>{activity.status}</Badge>
            <Badge>{activity.category}</Badge>
            {activity.ai_generated ? <Badge className="text-accent">AI</Badge> : null}
          </div>
          <h1 className="mt-4 text-2xl font-semibold sm:text-4xl">{activity.title}</h1>
          <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">{activity.description || "Nessuna descrizione inserita."}</p>
        </div>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <p className="flex items-center gap-2 rounded-xl bg-muted/70 p-3 text-sm">
          <Calendar className="h-4 w-4 text-primary" />
          {activity.starts_at ? format(new Date(activity.starts_at), "d MMM yyyy, HH:mm", { locale: it }) : "Data da definire"}
        </p>
        <p className="flex items-center gap-2 rounded-xl bg-muted/70 p-3 text-sm">
          <MapPin className="h-4 w-4 text-primary" />
          {activity.location_name || "Luogo da definire"}
        </p>
        <p className="flex items-center gap-2 rounded-xl bg-muted/70 p-3 text-sm">
          <Wallet className="h-4 w-4 text-primary" />
          {formatCurrencyRange(activity.budget_min, activity.budget_max)}
        </p>
      </div>
    </Card>
  );
}
