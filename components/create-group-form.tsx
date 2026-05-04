"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { createGroupAction } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";

export function CreateGroupForm() {
  const [state, action, pending] = useActionState(createGroupAction, null);

  return (
    <form action={action} className="rounded-2xl border bg-white p-5">
      <h2 className="font-semibold">Nuovo gruppo</h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <Label htmlFor="name">Nome gruppo</Label>
          <Input id="name" name="name" placeholder="Amici, squadra, club, community..." required />
        </div>
        <div>
          <Label htmlFor="description">Descrizione</Label>
          <Textarea id="description" name="description" placeholder="Che attività organizzate insieme?" />
        </div>
        <div>
          <Label htmlFor="invite_emails">Invita membri</Label>
          <Textarea id="invite_emails" name="invite_emails" placeholder="persona@email.it, team@email.it" />
        </div>
        <div>
          <Label htmlFor="invite_role">Ruolo inviti</Label>
          <Select id="invite_role" name="invite_role" defaultValue="member">
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </Select>
        </div>
      </div>
      {state?.error ? <p className="mt-3 text-sm text-destructive">{state.error}</p> : null}
      <Button className="mt-5" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Crea gruppo
      </Button>
    </form>
  );
}
