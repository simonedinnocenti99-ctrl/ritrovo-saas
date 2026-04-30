"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { createActivityAction } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import type { Group } from "@/lib/database.types";

const categories = ["Cena", "Viaggio", "Weekend", "Sport", "Cultura", "Aperitivo", "Evento aziendale", "Altro"];

export function CreateActivityForm({ defaults, groups }: { defaults?: Record<string, string>; groups: Array<Group & { role: string }> }) {
  const [state, action, pending] = useActionState(createActivityAction, null);

  return (
    <form action={action} className="grid gap-5 rounded-3xl border bg-white/82 p-5 shadow-sm lg:grid-cols-2">
      <div className="lg:col-span-2">
        <Label htmlFor="group_id">Contesto</Label>
        <Select id="group_id" name="group_id" defaultValue={defaults?.group_id ?? "personal"}>
          <option value="personal">Personale</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="lg:col-span-2">
        <Label htmlFor="title">Titolo</Label>
        <Input id="title" name="title" required defaultValue={defaults?.title} placeholder="Weekend al lago" />
      </div>
      <div className="lg:col-span-2">
        <Label htmlFor="description">Descrizione</Label>
        <Textarea id="description" name="description" defaultValue={defaults?.description} placeholder="Che tipo di ritrovo vuoi organizzare?" />
      </div>
      <div>
        <Label htmlFor="category">Categoria</Label>
        <Select id="category" name="category" defaultValue={defaults?.category ?? "Cena"}>
          {categories.map((category) => <option key={category}>{category}</option>)}
        </Select>
      </div>
      <div>
        <Label htmlFor="status">Stato iniziale</Label>
        <Select id="status" name="status" defaultValue="planning">
          <option value="draft">Bozza</option>
          <option value="planning">In pianificazione</option>
          <option value="scheduled">Programmato</option>
          <option value="completed">Completato</option>
        </Select>
      </div>
      <div>
        <Label htmlFor="starts_at">Data e ora inizio</Label>
        <Input id="starts_at" name="starts_at" type="datetime-local" />
      </div>
      <div>
        <Label htmlFor="ends_at">Data e ora fine</Label>
        <Input id="ends_at" name="ends_at" type="datetime-local" />
      </div>
      <div>
        <Label htmlFor="location_name">Luogo</Label>
        <Input id="location_name" name="location_name" defaultValue={defaults?.location_name} placeholder="Nome del posto" />
      </div>
      <div>
        <Label htmlFor="location_address">Indirizzo</Label>
        <Input id="location_address" name="location_address" placeholder="Via, città o link maps" />
      </div>
      <div>
        <Label htmlFor="budget_min">Budget minimo</Label>
        <Input id="budget_min" name="budget_min" type="number" min="0" defaultValue={defaults?.budget_min} />
      </div>
      <div>
        <Label htmlFor="budget_max">Budget massimo</Label>
        <Input id="budget_max" name="budget_max" type="number" min="0" defaultValue={defaults?.budget_max} />
      </div>
      <div>
        <Label htmlFor="duration">Durata stimata</Label>
        <Input id="duration" name="duration" defaultValue={defaults?.duration} placeholder="3 ore, 1 giorno, weekend" />
      </div>
      <div>
        <Label htmlFor="participants">Partecipanti da invitare</Label>
        <Input id="participants" name="participants" placeholder="Nomi o email separati da virgola" />
      </div>
      <div className="lg:col-span-2">
        <Label htmlFor="notes">Note interne</Label>
        <Textarea id="notes" name="notes" placeholder="Prenotazioni, vincoli, materiali, link utili" />
      </div>
      {state?.error ? <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive lg:col-span-2">{state.error}</p> : null}
      <div className="lg:col-span-2">
        <Button disabled={pending} size="lg">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Crea ritrovo
        </Button>
      </div>
    </form>
  );
}
