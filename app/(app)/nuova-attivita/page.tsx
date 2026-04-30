import { CreateActivityForm } from "@/components/create-activity-form";
import { PageHeader } from "@/components/page-header";
import { getCurrentWorkspace } from "@/lib/workspace";

export default async function NewActivityPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const workspace = await getCurrentWorkspace();
  const defaults = Object.fromEntries(Object.entries(params).filter(([, value]) => typeof value === "string")) as Record<string, string>;
  return (
    <>
      <PageHeader title="Crea ritrovo" subtitle="Scegli se organizzarlo come ritrovo personale o dentro uno dei tuoi gruppi." />
      <CreateActivityForm defaults={defaults} groups={workspace.groups} />
    </>
  );
}
