"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().email("Inserisci un indirizzo email valido."),
  password: z.string().min(6, "La password deve avere almeno 6 caratteri.")
});

const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, "Inserisci il tuo nome.")
});

function getSignupErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("user already registered") || normalized.includes("already registered")) {
    return "Esiste gia un account con questa email. Prova ad accedere.";
  }

  if (normalized.includes("email signups are disabled") || normalized.includes("signup disabled")) {
    return "La registrazione via email non e abilitata in Supabase Auth.";
  }

  if (normalized.includes("password")) {
    return "La password non rispetta i requisiti configurati in Supabase.";
  }

  if (normalized.includes("redirect") || normalized.includes("not allowed")) {
    return "Il redirect di registrazione non e autorizzato in Supabase Auth.";
  }

  if (normalized.includes("database") || normalized.includes("saving new user")) {
    return "Supabase non riesce a salvare il profilo utente. Verifica che la migrazione SQL sia stata applicata.";
  }

  return `Registrazione non riuscita: ${message}`;
}

export async function loginAction(_: unknown, formData: FormData) {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Dati non validi." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Email o password non corretti." };

  redirect(String(formData.get("next") || "/dashboard"));
}

export async function signupAction(_: unknown, formData: FormData) {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Dati non validi." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`
    }
  });

  if (error) {
    console.error("Supabase signup error", {
      status: error.status,
      code: error.code,
      message: error.message
    });

    return { error: getSignupErrorMessage(error.message) };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function resetPasswordAction(_: unknown, formData: FormData) {
  const email = z.string().email().safeParse(formData.get("email"));
  if (!email.success) return { error: "Inserisci un indirizzo email valido." };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email.data, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback?next=/aggiorna-password`
  });

  if (error) return { error: "Invio non riuscito. Controlla la configurazione Supabase Auth." };
  return { success: "Ti abbiamo inviato il link per recuperare la password." };
}
