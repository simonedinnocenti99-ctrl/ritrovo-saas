import Image from "next/image";
import { Trash2 } from "lucide-react";
import { deletePhotoAction } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import type { ActivityPhoto } from "@/lib/database.types";

export function PhotoGallery({ activityId, photos }: { activityId: string; photos: ActivityPhoto[] }) {
  if (!photos.length) return <p className="rounded-2xl border bg-white/70 p-5 text-sm text-muted-foreground">Nessuna foto caricata per questo ritrovo.</p>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {photos.map((photo) => (
        <figure key={photo.id} className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          {photo.signedUrl ? (
            <Image src={photo.signedUrl} alt={photo.caption || "Foto ritrovo"} width={800} height={600} className="aspect-[4/3] w-full object-cover" />
          ) : (
            <div className="aspect-[4/3] bg-muted" />
          )}
          <figcaption className="flex items-center justify-between gap-3 p-3 text-sm text-muted-foreground">
            <span>{photo.caption || "Foto ritrovo"}</span>
            <form action={deletePhotoAction}>
              <input type="hidden" name="activityId" value={activityId} />
              <input type="hidden" name="photoId" value={photo.id} />
              <input type="hidden" name="storagePath" value={photo.storage_path} />
              <Button size="icon" variant="ghost" aria-label="Elimina foto">
                <Trash2 className="h-4 w-4" />
              </Button>
            </form>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
