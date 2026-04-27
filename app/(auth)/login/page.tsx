import Link from "next/link";
import { AuthForm, PasswordResetForm } from "@/components/auth-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  return (
    <div className="w-full max-w-md">
      <AuthForm mode="login" next={params.next} />
      <PasswordResetForm />
      <p className="mt-5 text-center text-sm text-muted-foreground">
        Non hai un account? <Link className="font-medium text-primary" href="/registrati">Registrati</Link>
      </p>
    </div>
  );
}
