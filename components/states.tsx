import { AlertCircle, Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoadingState({ label = "Caricamento in corso" }: { label?: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-2xl border bg-white/70 text-muted-foreground">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      {label}
    </div>
  );
}

export function ErrorState({ title = "Qualcosa non ha funzionato", message }: { title?: string; message?: string }) {
  return (
    <div className="rounded-2xl border border-destructive/30 bg-white p-6 text-destructive">
      <AlertCircle className="mb-3 h-5 w-5" />
      <h2 className="font-semibold">{title}</h2>
      {message ? <p className="mt-2 text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}

export function EmptyState({ title, message, actionHref, actionLabel }: { title: string; message: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="rounded-2xl border bg-white/75 p-8 text-center shadow-sm">
      <PlusCircle className="mx-auto h-8 w-8 text-primary" />
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{message}</p>
      {actionHref && actionLabel ? (
        <Button asChild href={actionHref} className="mt-5">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
