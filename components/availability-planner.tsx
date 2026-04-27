import { format } from "date-fns";
import { it } from "date-fns/locale";
import { createAvailabilityOptionAction, respondAvailabilityAction } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import type { AvailabilityOption, AvailabilityResponse } from "@/lib/database.types";

export function AvailabilityPlanner({ activityId, options, responses }: { activityId: string; options: AvailabilityOption[]; responses: AvailabilityResponse[] }) {
  const ranked = options
    .map((option) => ({
      option,
      available: responses.filter((r) => r.option_id === option.id && r.status === "available").length,
      maybe: responses.filter((r) => r.option_id === option.id && r.status === "maybe").length
    }))
    .sort((a, b) => b.available - a.available || b.maybe - a.maybe);
  const bestId = ranked[0]?.option.id;

  return (
    <div className="space-y-4">
      <form action={createAvailabilityOptionAction} className="grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-2">
        <input type="hidden" name="activityId" value={activityId} />
        <div className="sm:col-span-2">
          <Label htmlFor="availability-label">Etichetta</Label>
          <Input id="availability-label" name="label" placeholder="Sabato pomeriggio" />
        </div>
        <div>
          <Label htmlFor="availability-start">Inizio</Label>
          <Input id="availability-start" name="starts_at" type="datetime-local" required />
        </div>
        <div>
          <Label htmlFor="availability-end">Fine</Label>
          <Input id="availability-end" name="ends_at" type="datetime-local" required />
        </div>
        <Button className="sm:col-span-2" variant="secondary">Aggiungi fascia</Button>
      </form>

      {ranked.map(({ option, available, maybe }) => (
        <div key={option.id} className="rounded-2xl border bg-white p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold">{option.label || "Opzione disponibilita"} {bestId === option.id ? <span className="text-primary">migliore</span> : null}</h3>
              <p className="text-sm text-muted-foreground">
                {format(new Date(option.starts_at), "d MMM HH:mm", { locale: it })} - {format(new Date(option.ends_at), "d MMM HH:mm", { locale: it })}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">{available} disponibili, {maybe} forse</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              ["available", "Disponibile"],
              ["maybe", "Forse"],
              ["unavailable", "Non posso"]
            ].map(([value, label]) => (
              <form key={value} action={respondAvailabilityAction}>
                <input type="hidden" name="activityId" value={activityId} />
                <input type="hidden" name="optionId" value={option.id} />
                <input type="hidden" name="status" value={value} />
                <Button size="sm" variant={value === "available" ? "default" : "outline"}>{label}</Button>
              </form>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
