"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { createGroupAction } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

export function CreateGroupForm() {
  const [state, action, pending] = useActionState(createGroupAction, null);

  return (
    <form action={action} className="rounded-2xl border bg-white p-5">
      <h2 className="font-semibold">Nuovo gruppo</h2>
      <div className="mt-4 space-y-4">
        <div>
          <Label htmlFor="name">Nome gruppo</Label>
          <Input id="name" name="name" placeholder="Partner, dipendenti, amici..." required />
        </div>
        <div>
          <Label htmlFor="description">Descrizione</Label>
          <Textarea id="description" name="description" placeholder="A cosa serve questo gruppo?" />
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
