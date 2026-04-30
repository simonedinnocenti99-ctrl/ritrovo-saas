"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { loginAction, resetPasswordAction, signupAction } from "@/app/auth/actions";

export function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const action = mode === "login" ? loginAction : signupAction;
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="w-full max-w-md rounded-3xl border bg-white/85 p-6 shadow-soft">
      <input type="hidden" name="next" value={next ?? "/dashboard"} />
      <h1 className="text-2xl font-semibold">{mode === "login" ? "Bentornato" : "Crea il tuo Ritrovo"}</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {mode === "login"
          ? "Accedi per gestire attività, sondaggi e foto del gruppo."
          : "Parti con uno spazio privato. Potrai invitare gli altri dopo il primo accesso."}
      </p>
      <div className="mt-6 space-y-4">
        {mode === "signup" ? (
          <div>
            <Label htmlFor="fullName">Nome</Label>
            <Input id="fullName" name="fullName" autoComplete="name" required />
          </div>
        ) : null}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required />
        </div>
      </div>
      {state?.error ? <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{state.error}</p> : null}
      <Button className="mt-6 w-full" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {mode === "login" ? "Accedi" : "Registrati"}
      </Button>
    </form>
  );
}

export function PasswordResetForm() {
  const [state, action, pending] = useActionState(resetPasswordAction, null);
  return (
    <form action={action} className="mt-6 rounded-2xl border bg-white/70 p-4">
      <Label htmlFor="reset-email">Recupero password</Label>
      <div className="mt-2 flex gap-2">
        <Input id="reset-email" name="email" type="email" placeholder="email@esempio.it" />
        <Button variant="secondary" disabled={pending}>Invia</Button>
      </div>
      {state?.success ? <p className="mt-2 text-sm text-primary">{state.success}</p> : null}
      {state?.error ? <p className="mt-2 text-sm text-destructive">{state.error}</p> : null}
    </form>
  );
}
