import { format } from "date-fns";
import { it } from "date-fns/locale";
import type { Activity } from "@/lib/database.types";

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  return (
    <ol className="space-y-4">
      {activities.map((activity) => (
        <li key={activity.id} className="grid grid-cols-[5rem_1fr] gap-4">
          <time className="text-sm font-medium text-primary">
            {activity.starts_at ? format(new Date(activity.starts_at), "d MMM", { locale: it }) : "TBD"}
          </time>
          <div className="border-l pl-4">
            <h3 className="font-medium">{activity.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{activity.location_name || activity.category}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
