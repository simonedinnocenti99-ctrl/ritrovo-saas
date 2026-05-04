import Link from "next/link";
import { ActivityCard } from "@/components/activity-card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { listActivityOverview, type ActivityListFilters, type ActivityListItem } from "@/lib/data";
import { cn } from "@/lib/utils";
import { getCurrentWorkspace } from "@/lib/workspace";

const categories = ["Cena", "Viaggio", "Weekend", "Sport", "Cultura", "Aperitivo", "Evento aziendale", "Altro"];

const tabs = [
  { value: "all", label: "Tutti" },
  { value: "upcoming", label: "Prossimi" },
  { value: "decision", label: "In decisione" },
  { value: "personal", label: "Personali" },
  { value: "group", label: "Di gruppo" },
  { value: "completed", label: "Completati" }
];

function tabHref(tab: string, filters: ActivityListFilters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (!value || value === "all" || key === "tab" || (key === "sort" && value === "relevant")) continue;
    params.set(key, value);
  }
  if (tab !== "all") params.set("tab", tab);
  const query = params.toString();
  return query ? `/attivita?${query}` : "/attivita";
}

function emptyCopy(filters: ActivityListFilters) {
  if (filters.tab === "personal" || filters.context === "personal") {
    return {
      title: "Non hai ancora ritrovi personali",
      message: "Crea un ritrovo personale e invita le persone con cui vuoi organizzarti."
    };
  }
  if (filters.tab === "group" || filters.context === "group" || filters.group) {
    return {
      title: "Non ci sono ancora ritrovi collegati ai tuoi gruppi",
      message: "Crea un ritrovo dentro un gruppo per raccogliere disponibilita, RSVP e note condivise."
    };
  }
  if (filters.tab === "public" || filters.context === "public") {
    return {
      title: "I ritrovi pubblici saranno visibili qui quando disponibili",
      message: "La lista e gia pronta a distinguerli, appena saranno collegati al backend pubblico."
    };
  }
  const hasActiveFilter = Object.entries(filters).some(([key, value]) => Boolean(value) && value !== "all" && !(key === "sort" && value === "relevant"));
  if (hasActiveFilter) {
    return {
      title: "Nessun ritrovo trovato",
      message: "Prova a cambiare filtro oppure crea un nuovo ritrovo personale o di gruppo."
    };
  }
  return {
    title: "Non hai ancora creato ritrovi",
    message: "Crea il primo e condividilo con il tuo gruppo o con le persone che vuoi invitare."
  };
}

function statCards(activities: ActivityListItem[]) {
  return [
    { label: "Prossimi", value: activities.filter((activity) => activity.status === "scheduled").length },
    { label: "In decisione", value: activities.filter((activity) => activity.status === "draft" || activity.status === "planning" || activity.hasOpenPoll).length },
    { label: "Personali", value: activities.filter((activity) => activity.contextType === "personal").length },
    { label: "Di gruppo", value: activities.filter((activity) => activity.contextType === "group").length },
    { label: "Risposte mancanti", value: activities.reduce((total, activity) => total + activity.participantCounts.pending, 0) }
  ];
}

export default async function ActivitiesPage({
  searchParams
}: {
  searchParams: Promise<ActivityListFilters>;
}) {
  const filters = await searchParams;
  const workspace = await getCurrentWorkspace();
  const selectedGroup = filters.group ? workspace.groups.find((group) => group.id === filters.group) : null;
  const activities = await listActivityOverview(workspace.user.id, filters);
  const allActivities = await listActivityOverview(workspace.user.id);
  const activeTab = filters.tab ?? "all";
  const empty = emptyCopy(filters);

  return (
    <>
      <PageHeader
        title={selectedGroup ? `Ritrovi di ${selectedGroup.name}` : "Ritrovi"}
        subtitle="Tutti i ritrovi personali e di gruppo, con stato, risposte e prossima azione utile a vista."
        action={<Button asChild href={selectedGroup ? `/nuova-attivita?group_id=${selectedGroup.id}` : "/nuova-attivita"}>Nuovo ritrovo</Button>}
        breadcrumbs={selectedGroup ? [{ label: "Gruppi", href: "/gruppi" }, { label: selectedGroup.name, href: `/gruppi/${selectedGroup.id}` }, { label: "Ritrovi" }] : undefined}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {statCards(allActivities).map((item) => (
          <div key={item.label} className="rounded-2xl border bg-white/75 p-4 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold">{item.value}</p>
          </div>
        ))}
      </div>

      <nav className="mb-4 flex gap-2 overflow-x-auto pb-1" aria-label="Sezioni ritrovi">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={tabHref(tab.value, filters)}
            className={cn(
              "min-w-fit rounded-full border px-3 py-2 text-sm font-medium transition",
              activeTab === tab.value ? "bg-primary text-primary-foreground" : "bg-white/75 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <form className="mb-6 grid gap-3 rounded-2xl border bg-white/75 p-4 shadow-sm md:grid-cols-[1fr_11rem_11rem_11rem] xl:grid-cols-[1fr_11rem_11rem_11rem_11rem_12rem_auto]">
        {activeTab !== "all" ? <input type="hidden" name="tab" value={activeTab} /> : null}
        <Input name="q" defaultValue={filters.q} placeholder="Cerca ritrovo" />
        <Select name="status" defaultValue={filters.status ?? "all"} aria-label="Stato">
          <option value="all">Ogni stato</option>
          <option value="draft">Bozza</option>
          <option value="planning">Da confermare</option>
          <option value="scheduled">Programmato</option>
          <option value="completed">Completato</option>
          <option value="cancelled">Archiviato</option>
        </Select>
        <Select name="context" defaultValue={filters.context ?? "all"} aria-label="Contesto">
          <option value="all">Ogni contesto</option>
          <option value="personal">Personale</option>
          <option value="group">Di gruppo</option>
          <option value="public">Pubblico</option>
        </Select>
        <Select name="group" defaultValue={filters.group ?? "all"} aria-label="Gruppo">
          <option value="all">Ogni gruppo</option>
          {workspace.groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </Select>
        <Select name="category" defaultValue={filters.category ?? "all"} aria-label="Categoria">
          <option value="all">Ogni categoria</option>
          {categories.map((category) => <option key={category}>{category}</option>)}
        </Select>
        <Select name="sort" defaultValue={filters.sort ?? "relevant"} aria-label="Ordinamento">
          <option value="relevant">Piu rilevanti</option>
          <option value="recent">Piu recenti</option>
          <option value="todo">Da completare</option>
          <option value="participants">Piu partecipati</option>
          <option value="requests">Richieste pendenti</option>
          <option value="alphabetic">Alfabetico</option>
        </Select>
        <Button>Filtra</Button>
      </form>

      <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Badge>{activities.length} ritrovi mostrati</Badge>
        <Badge>Personale con invitati supportato</Badge>
        <Badge>Pubblici predisposti</Badge>
      </div>

      {activities.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{activities.map((activity) => <ActivityCard key={activity.id} activity={activity} />)}</div>
      ) : (
        <EmptyState title={empty.title} message={empty.message} actionHref="/nuova-attivita" actionLabel="Crea nuovo ritrovo" />
      )}
    </>
  );
}
