import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function SignupPage() {
  return (
    <div className="w-full max-w-md">
      <AuthForm mode="signup" />
      <p className="mt-5 text-center text-sm text-muted-foreground">
        Hai gia un account? <Link className="font-medium text-primary" href="/login">Accedi</Link>
      </p>
    </div>
  );
}
