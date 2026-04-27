import { CreateActivityForm } from "@/components/create-activity-form";
import { PageHeader } from "@/components/page-header";

export default async function NewActivityPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const defaults = Object.fromEntries(Object.entries(params).filter(([, value]) => typeof value === "string")) as Record<string, string>;
  return (
    <>
      <PageHeader title="Crea attivita" subtitle="Inserisci i dettagli noti. Puoi lasciare data o luogo da definire e usare disponibilita e sondaggi dopo la creazione." />
      <CreateActivityForm defaults={defaults} />
    </>
  );
}
