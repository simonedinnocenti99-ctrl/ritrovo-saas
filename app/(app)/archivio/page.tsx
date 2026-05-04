import Link from "next/link";
import { Archive, Camera, NotebookText } from "lucide-react";
import { ActivityTimeline } from "@/components/activity-timeline";
import { EmptyState } from "@/components/states";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data";
import { getCurrentWorkspace } from "@/lib/workspace";

export default async function ArchivePage() {
  const workspace = await getCurrentWorkspace();
  const data = await getDashboardData(workspace.user.id);

  return (
    <>
      <PageHeader
        title="Archivio"
        subtitle="Lo storico delle attivita concluse: note, foto, sondaggi chiusi e ricordi dei gruppi."
        action={<Button asChild href="/attivita?status=past" variant="secondary">Vedi attivita concluse</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Card>
          <CardHeader><CardTitle>Attivita concluse</CardTitle></CardHeader>
          {data.past.length ? (
            <ActivityTimeline activities={data.past} />
          ) : (
            <EmptyState title="Archivio ancora vuoto" message="Quando un ritrovo verra completato, comparira qui con note, foto e informazioni utili da ritrovare." actionHref="/attivita?status=future" actionLabel="Vai ai ritrovi" />
          )}
        </Card>

        <Card>
          <CardHeader><CardTitle>Memoria dei gruppi</CardTitle></CardHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p className="flex gap-3"><Archive className="h-4 w-4 shrink-0 text-primary" />Ritrova le attivita passate senza mischiarle con quelle da organizzare.</p>
            <p className="flex gap-3"><Camera className="h-4 w-4 shrink-0 text-primary" />Aggiungi foto e ricordi dai dettagli dei ritrovi completati.</p>
            <p className="flex gap-3"><NotebookText className="h-4 w-4 shrink-0 text-primary" />Conserva note, decisioni e preferenze emerse nei gruppi.</p>
          </div>
          <Link href="/gruppi" className="mt-5 inline-flex text-sm font-medium text-primary">Apri gruppi</Link>
        </Card>
      </div>
    </>
  );
}
