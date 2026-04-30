import { ActivityCard } from "@/components/activity-card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { listGroupActivities, listMyActivities } from "@/lib/data";
import { getCurrentWorkspace } from "@/lib/workspace";

export default async function ActivitiesPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; category?: string; group?: string }> }) {
  const filters = await searchParams;
  const workspace = await getCurrentWorkspace();
  const selectedGroup = filters.group ? workspace.groups.find((group) => group.id === filters.group) : null;
  const activities = selectedGroup
    ? await listGroupActivities(selectedGroup.id, filters)
    : await listMyActivities(workspace.user.id, workspace.organization.id, filters);

  return (
    <>
      <PageHeader
        title={selectedGroup ? `Ritrovi - ${selectedGroup.name}` : "I miei ritrovi"}
        subtitle={selectedGroup ? "Vista dedicata al gruppo selezionato." : "Tutti i ritrovi che ti riguardano, personali o collegati ai tuoi gruppi."}
        action={<Button asChild href={selectedGroup ? `/nuova-attivita?group_id=${selectedGroup.id}` : "/nuova-attivita"}>Nuovo ritrovo</Button>}
      />
      <form className="mb-6 grid gap-3 rounded-2xl border bg-white/75 p-4 md:grid-cols-[1fr_12rem_12rem_auto]">
        {selectedGroup ? <input type="hidden" name="group" value={selectedGroup.id} /> : null}
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
        <EmptyState title="Nessun ritrovo trovato" message="Prova a cambiare filtro oppure crea un nuovo ritrovo." actionHref="/nuova-attivita" actionLabel="Crea ritrovo" />
      )}
    </>
  );
}
