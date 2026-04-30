import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityCard } from "@/components/activity-card";
import { ActivityTimeline } from "@/components/activity-timeline";
import { EmptyState } from "@/components/states";
import { PageHeader } from "@/components/page-header";
import { getDashboardData } from "@/lib/data";
import { getCurrentWorkspace } from "@/lib/workspace";

export default async function DashboardPage() {
  const workspace = await getCurrentWorkspace();
  const data = await getDashboardData(workspace.user.id, workspace.organization.id);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="I miei ritrovi: personali, creati da te o collegati ai gruppi di cui fai parte."
        action={<Button asChild href="/nuova-attivita">Crea ritrovo</Button>}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card><p className="text-sm text-muted-foreground">Prossimi</p><p className="mt-2 text-3xl font-semibold">{data.upcoming.length}</p></Card>
        <Card><p className="text-sm text-muted-foreground">Passate</p><p className="mt-2 text-3xl font-semibold">{data.past.length}</p></Card>
        <Card><p className="text-sm text-muted-foreground">Sondaggi aperti</p><p className="mt-2 text-3xl font-semibold">{data.openPolls.length}</p></Card>
      </div>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Prossimi ritrovi</h2>
          <Link className="text-sm font-medium text-primary" href="/attivita?status=future">Vedi tutte</Link>
        </div>
        {data.upcoming.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{data.upcoming.map((activity) => <ActivityCard key={activity.id} activity={activity} />)}</div>
        ) : (
          <EmptyState title="Nessun ritrovo futuro" message="Crea un ritrovo personale o organizza il prossimo appuntamento in un gruppo." actionHref="/nuova-attivita" actionLabel="Crea ritrovo" />
        )}
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
        <Card>
          <CardHeader><CardTitle>Ultimi ritrovi passati</CardTitle></CardHeader>
          {data.past.length ? <ActivityTimeline activities={data.past} /> : <p className="text-sm text-muted-foreground">Lo storico comparira qui dopo i primi eventi completati.</p>}
        </Card>
        <Card>
          <CardHeader><CardTitle>Suggerimenti rapidi</CardTitle></CardHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>Raccogli disponibilita prima di fissare una data definitiva.</p>
            <p>Trasforma le idee AI in bozze e poi fai votare il gruppo.</p>
            <p>Carica foto sugli eventi completati per creare una memoria consultabile.</p>
          </div>
          <Button asChild href="/assistente" variant="secondary" className="mt-5">Apri assistente AI</Button>
        </Card>
      </div>
    </>
  );
}
