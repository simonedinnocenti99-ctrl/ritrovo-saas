"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password.length < 6) {
      setError("La nuova password deve avere almeno 6 caratteri.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Le password non coincidono.");
      return;
    }

    setPending(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setPending(false);

    if (updateError) {
      setError("Non sono riuscito ad aggiornare la password. Apri di nuovo il link ricevuto via email.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md rounded-3xl border bg-white/85 p-6 shadow-soft">
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
      {error ? <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
      <Button className="mt-6 w-full" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Aggiorna password
      </Button>
    </form>
  );
}
