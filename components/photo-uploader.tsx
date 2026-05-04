"use client";

import { useActionState, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { Camera, Loader2, UploadCloud, X } from "lucide-react";
import { uploadPhotoAction } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

const maxPhotoSize = 5 * 1024 * 1024;
const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];

export function PhotoUploader({ activityId, canUpload }: { activityId: string; canUpload: boolean }) {
  const [state, action, pending] = useActionState(uploadPhotoAction, null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);
  const helperId = useMemo(() => `photo-help-${activityId}`, [activityId]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setClientError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    if (!file) {
      setPreviewUrl(null);
      return;
    }

    if (!acceptedTypes.includes(file.type)) {
      setPreviewUrl(null);
      event.target.value = "";
      setClientError("Formato non supportato. Usa JPG, PNG o WEBP.");
      return;
    }

    if (file.size > maxPhotoSize) {
      setPreviewUrl(null);
      event.target.value = "";
      setClientError("La foto e troppo grande.");
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
  }

  if (!canUpload) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
        <div className="flex items-start gap-3">
          <Camera className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>Non hai i permessi per caricare foto in questo ritrovo.</p>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="rounded-2xl border bg-white p-4">
      <input type="hidden" name="activityId" value={activityId} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_12rem]">
        <div>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
            <div>
              <Label htmlFor="photo">Foto</Label>
              <Input id="photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" aria-describedby={helperId} required onChange={handleFileChange} />
            </div>
            <div>
              <Label htmlFor="caption">Caption</Label>
              <Input id="caption" name="caption" maxLength={160} placeholder="Un ricordo da tenere" />
            </div>
            <Button disabled={pending || Boolean(clientError)} className="min-h-11">
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              Carica foto
            </Button>
          </div>
          <p id={helperId} className="mt-3 text-xs leading-5 text-muted-foreground">
            Puoi caricare immagini JPG, PNG o WEBP. Massimo 5 MB per foto.
          </p>
          {clientError ? <p className="mt-3 text-sm text-destructive">{clientError}</p> : null}
          {state?.error ? <p className="mt-3 text-sm text-destructive">{state.error}</p> : null}
          {state?.success ? <p className="mt-3 text-sm text-primary">{state.success}</p> : null}
        </div>
        <div className="min-h-36 overflow-hidden rounded-xl border bg-muted/40">
          {previewUrl ? (
            <div className="relative h-full min-h-36">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Anteprima foto selezionata" className="h-full min-h-36 w-full object-cover" />
              <button
                type="button"
                className="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm"
                aria-label="Rimuovi anteprima"
                onClick={() => {
                  URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(null);
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex h-full min-h-36 flex-col items-center justify-center p-4 text-center text-sm text-muted-foreground">
              <Camera className="mb-2 h-5 w-5 text-primary" />
              Anteprima foto
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
