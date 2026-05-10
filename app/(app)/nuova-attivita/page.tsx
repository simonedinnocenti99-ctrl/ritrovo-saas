import { CreateActivityForm } from "@/components/create-activity-form";
import { PageHeader } from "@/components/page-header";
import { getCurrentWorkspace } from "@/lib/workspace";

export default async function NewActivityPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const workspace = await getCurrentWorkspace();
  const defaults = Object.fromEntries(Object.entries(params).filter(([, value]) => typeof value === "string")) as Record<string, string>;
  return (
    <>
      <PageHeader
        title="Nuovo ritrovo"
        subtitle="Crea un ritrovo con un flusso piu corto: informazioni base, tipo, data e luogo insieme, inviti con accesso e budget in euro."
        breadcrumbs={[{ label: "Ritrovi", href: "/attivita" }, { label: "Nuovo ritrovo" }]}
      />
      <CreateActivityForm defaults={defaults} groups={workspace.groups} />
    </>
  );
}
