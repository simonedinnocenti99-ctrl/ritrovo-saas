"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { CalendarClock, Camera, Trash2, X } from "lucide-react";
import { deletePhotoAction } from "@/app/(app)/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ActivityPhoto } from "@/lib/database.types";

function formatPhotoDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
}

function DeletePhotoButton({ activityId, photo }: { activityId: string; photo: ActivityPhoto }) {
  const [state, action, pending] = useActionState(deletePhotoAction, null);

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm("Vuoi rimuovere questa foto dal ritrovo?")) event.preventDefault();
      }}
    >
      <input type="hidden" name="activityId" value={activityId} />
      <input type="hidden" name="photoId" value={photo.id} />
      <input type="hidden" name="storagePath" value={photo.storage_path} />
      <Button size="sm" variant="ghost" disabled={pending} aria-label="Rimuovi foto">
        <Trash2 className="h-4 w-4" />
        <span className="hidden sm:inline">Rimuovi foto</span>
      </Button>
      {state?.error ? <p className="mt-2 text-xs text-destructive">{state.error}</p> : null}
    </form>
  );
}

export function PhotoGallery({
  activityId,
  activityTitle,
  activityDate,
  photos,
  currentUserId
}: {
  activityId: string;
  activityTitle: string;
  activityDate?: string | null;
  photos: ActivityPhoto[];
  currentUserId: string;
}) {
  const [selectedPhoto, setSelectedPhoto] = useState<ActivityPhoto | null>(null);

  if (!photos.length) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/30 p-5 text-sm leading-6 text-muted-foreground">
        Non ci sono ancora foto per questo ritrovo.
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, index) => {
          const canDelete = photo.uploaded_by === currentUserId;

          return (
            <figure key={photo.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
              <button type="button" className="block w-full text-left" onClick={() => setSelectedPhoto(photo)}>
                {photo.signedUrl ? (
                  <Image src={photo.signedUrl} alt={photo.caption || `Foto di ${activityTitle}`} width={800} height={600} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-muted text-muted-foreground">
                    <Camera className="h-6 w-6" />
                  </div>
                )}
              </button>
              <figcaption className="space-y-3 p-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="line-clamp-2 font-medium text-foreground">{photo.caption || "Foto del ritrovo"}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarClock className="h-3.5 w-3.5 shrink-0 text-primary" />
                      {formatPhotoDate(photo.created_at)}
                    </p>
                    {photo.uploadedByName ? <p className="mt-1 truncate text-xs text-muted-foreground">Caricata da {photo.uploadedByName}</p> : null}
                  </div>
                  {index === 0 ? <Badge className="shrink-0">Anteprima</Badge> : null}
                </div>
                {canDelete ? <DeletePhotoButton activityId={activityId} photo={photo} /> : null}
              </figcaption>
            </figure>
          );
        })}
      </div>

      {selectedPhoto ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/70 p-3 sm:p-6" role="dialog" aria-modal="true" aria-label="Anteprima foto">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b p-3 sm:p-4">
              <div className="min-w-0">
                <p className="truncate font-semibold">{selectedPhoto.caption || activityTitle}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {activityTitle}{activityDate ? ` - ${new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short", year: "numeric" }).format(new Date(activityDate))}` : ""}
                </p>
              </div>
              <Button type="button" size="icon" variant="ghost" onClick={() => setSelectedPhoto(null)} aria-label="Chiudi anteprima">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid max-h-[calc(92vh-4rem)] overflow-auto lg:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="flex min-h-72 items-center justify-center bg-black">
                {selectedPhoto.signedUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedPhoto.signedUrl} alt={selectedPhoto.caption || `Foto di ${activityTitle}`} className="max-h-[72vh] w-full object-contain" />
                ) : (
                  <div className="flex h-72 w-full items-center justify-center text-white">
                    <Camera className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="space-y-4 p-4 text-sm">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Ritrovo di origine</p>
                  <p className="mt-1 font-medium">{activityTitle}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Caricamento</p>
                  <p className="mt-1">{formatPhotoDate(selectedPhoto.created_at)}</p>
                </div>
                {selectedPhoto.uploadedByName ? (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Autore</p>
                    <p className="mt-1">{selectedPhoto.uploadedByName}</p>
                  </div>
                ) : null}
                {selectedPhoto.caption ? (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Caption</p>
                    <p className="mt-1 leading-6">{selectedPhoto.caption}</p>
                  </div>
                ) : null}
                {selectedPhoto.uploaded_by === currentUserId ? <DeletePhotoButton activityId={activityId} photo={selectedPhoto} /> : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
