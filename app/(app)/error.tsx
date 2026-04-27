"use client";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/states";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-4">
      <ErrorState message="Riprova o torna alla dashboard se il problema continua." />
      <Button onClick={reset}>Riprova</Button>
    </div>
  );
}
