"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { uploadPhotoAction } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function PhotoUploader({ activityId }: { activityId: string }) {
  const [state, action, pending] = useActionState(uploadPhotoAction, null);
  return (
    <form action={action} className="rounded-2xl border bg-white p-4">
      <input type="hidden" name="activityId" value={activityId} />
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <Label htmlFor="photo">Foto</Label>
          <Input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required />
        </div>
        <div>
          <Label htmlFor="caption">Caption</Label>
          <Input id="caption" name="caption" maxLength={160} placeholder="Un ricordo da tenere" />
        </div>
        <Button disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Carica
        </Button>
      </div>
      {state?.error ? <p className="mt-3 text-sm text-destructive">{state.error}</p> : null}
      {state?.success ? <p className="mt-3 text-sm text-primary">{state.success}</p> : null}
    </form>
  );
}
