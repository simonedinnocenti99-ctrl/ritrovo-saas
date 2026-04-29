"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function prepareRecoverySession() {
      setError("");

      const code = searchParams.get("code");
      if (code) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("next", "/aggiorna-password");
        window.location.replace(`/auth/callback?${params.toString()}`);
        return;
      }

      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (!active) return;

        if (sessionError) {
          setError(`Sessione di recupero non valida: ${sessionError.message}`);
          setSessionReady(false);
          return;
        }

        window.history.replaceState(null, "", "/aggiorna-password");
        setSessionReady(true);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSessionReady(Boolean(data.session));
      if (!data.session) {
        setError("Apri questa pagina dal link di recupero ricevuto via email.");
      }
    }

    prepareRecoverySession();

    return () => {
      active = false;
    };
  }, [searchParams, supabase]);

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

    if (!sessionReady) {
      setError("Sessione di recupero non pronta. Apri di nuovo il link ricevuto via email.");
      return;
    }

    setPending(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setPending(false);

    if (updateError) {
      setError(`Non sono riuscito ad aggiornare la password: ${updateError.message}`);
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
          <Input id="password" name="password" type="password" autoComplete="new-password" required disabled={!sessionReady || pending} />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Conferma password</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required disabled={!sessionReady || pending} />
        </div>
      </div>
      {error ? <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
      <Button className="mt-6 w-full" disabled={!sessionReady || pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Aggiorna password
      </Button>
    </form>
  );
}
