import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const next = params.next ?? "/dashboard";

  return (
    <div className="w-full max-w-md">
      <AuthForm mode="signup" next={next} />
      <p className="mt-5 text-center text-sm text-muted-foreground">
        Hai gia un account? <Link className="font-medium text-primary" href={`/login?next=${encodeURIComponent(next)}`}>Accedi</Link>
      </p>
    </div>
  );
}
