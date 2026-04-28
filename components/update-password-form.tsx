"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { updatePasswordAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function UpdatePasswordForm() {
  const [state, action, pending] = useActionState(updatePasswordAction, null);

  return (
    <form action={action} className="w-full max-w-md rounded-3xl border bg-white/85 p-6 shadow-soft">
      <h1 className="text-2xl font-semibold">Imposta nuova password</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Scegli una nuova password per completare il recupero del tuo account.
      </p>
      <div className="mt-6 space-y-4">
        <div>
          <Label htmlFor="password">Nuova password</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" required />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Conferma password</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
        </div>
      </div>
      {state?.error ? <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{state.error}</p> : null}
      <Button className="mt-6 w-full" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Aggiorna password
      </Button>
    </form>
  );
}
