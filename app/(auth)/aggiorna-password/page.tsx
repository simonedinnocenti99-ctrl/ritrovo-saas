import Link from "next/link";
import { Suspense } from "react";
import { LoadingState } from "@/components/states";
import { UpdatePasswordForm } from "@/components/update-password-form";

export default function UpdatePasswordPage() {
  return (
    <div className="w-full max-w-md">
      <Suspense fallback={<LoadingState label="Preparo il recupero password" />}>
        <UpdatePasswordForm />
      </Suspense>
      <p className="mt-5 text-center text-sm text-muted-foreground">
        Hai gia aggiornato la password? <Link className="font-medium text-primary" href="/login">Accedi</Link>
      </p>
    </div>
  );
}
