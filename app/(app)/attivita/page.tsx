import { ActivityCard } from "@/components/activity-card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { listActivities } from "@/lib/data";
import { getCurrentWorkspace } from "@/lib/workspace";

export default async function ActivitiesPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; category?: string }> }) {
  const filters = await searchParams;
  const workspace = await getCurrentWorkspace();
  const activities = await listActivities(workspace.group.id, filters);

  return (
    <>
      <PageHeader title="Archivio attivita" subtitle="Cerca nello storico e nelle attivita future del gruppo." action={<Button asChild href="/nuova-attivita">Nuova attivita</Button>} />
      <form className="mb-6 grid gap-3 rounded-2xl border bg-white/75 p-4 md:grid-cols-[1fr_12rem_12rem_auto]">
        <Input name="q" defaultValue={filters.q} placeholder="Cerca per titolo" />
        <Select name="status" defaultValue={filters.status ?? "all"}>
          <option value="all">Tutte</option>
          <option value="future">Future</option>
          <option value="past">Passate</option>
        </Select>
        <Select name="category" defaultValue={filters.category ?? "all"}>
          <option value="all">Ogni categoria</option>
          {["Cena", "Viaggio", "Weekend", "Sport", "Cultura", "Aperitivo", "Evento aziendale", "Altro"].map((category) => <option key={category}>{category}</option>)}
        </Select>
        <Button>Filtra</Button>
      </form>
      {activities.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{activities.map((activity) => <ActivityCard key={activity.id} activity={activity} />)}</div>
      ) : (
        <EmptyState title="Nessuna attivita trovata" message="Prova a cambiare filtro oppure crea una nuova attivita." actionHref="/nuova-attivita" actionLabel="Crea attivita" />
      )}
    </>
  );
}
