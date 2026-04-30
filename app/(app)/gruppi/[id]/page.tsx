import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityCard } from "@/components/activity-card";
import { EmptyState } from "@/components/states";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getGroupDashboardData, listGroupActivities } from "@/lib/data";
import { getCurrentWorkspace } from "@/lib/workspace";

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workspace = await getCurrentWorkspace();
  const group = workspace.groups.find((item) => item.id === id);
  if (!group) notFound();

  const [data, activities] = await Promise.all([getGroupDashboardData(group.id), listGroupActivities(group.id)]);

  return (
    <>
      <PageHeader
        title={group.name}
        subtitle={group.description ?? "Ritrovi e persone collegati a questo gruppo."}
        action={<Button asChild href={`/nuova-attivita?group_id=${group.id}`}>Nuovo ritrovo</Button>}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card><p className="text-sm text-muted-foreground">Ritrovi totali</p><p className="mt-2 text-3xl font-semibold">{activities.length}</p></Card>
        <Card><p className="text-sm text-muted-foreground">Prossimi</p><p className="mt-2 text-3xl font-semibold">{data.upcoming.length}</p></Card>
        <Card><p className="text-sm text-muted-foreground">Sondaggi aperti</p><p className="mt-2 text-3xl font-semibold">{data.openPolls.length}</p></Card>
      </div>
      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Ritrovi del gruppo</h2>
          <Link className="text-sm font-medium text-primary" href={`/attivita?group=${group.id}`}>Vista aggregata</Link>
        </div>
        {activities.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{activities.map((activity) => <ActivityCard key={activity.id} activity={activity} />)}</div>
        ) : (
          <EmptyState title="Nessun ritrovo nel gruppo" message="Crea il primo ritrovo per questo pubblico ricorrente." actionHref={`/nuova-attivita?group_id=${group.id}`} actionLabel="Crea ritrovo" />
        )}
      </section>
      <Card className="mt-8">
        <CardHeader><CardTitle>Gestione gruppo</CardTitle></CardHeader>
        <p className="text-sm text-muted-foreground">Modifica nome, descrizione e inviti dalla pagina impostazioni.</p>
        <Button asChild href="/impostazioni/gruppo" variant="secondary" className="mt-5">Apri impostazioni</Button>
      </Card>
    </>
  );
}
