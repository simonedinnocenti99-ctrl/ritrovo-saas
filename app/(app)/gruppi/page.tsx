import Link from "next/link";
import { UsersRound } from "lucide-react";
import { CreateGroupForm } from "@/components/create-group-form";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/states";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentWorkspace } from "@/lib/workspace";

export default async function GroupsPage() {
  const workspace = await getCurrentWorkspace();

  return (
    <>
      <PageHeader title="Gruppi" subtitle="Organizza pubblici ricorrenti: partner, dipendenti, team, amici o community." />
      <div className="grid gap-6 xl:grid-cols-[1fr_24rem]">
        <section>
          {workspace.groups.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {workspace.groups.map((group) => (
                <Link key={group.id} href={`/gruppi/${group.id}`} className="block">
                  <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-soft">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                        <UsersRound className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="font-semibold">{group.name}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">{group.description || "Nessuna descrizione inserita."}</p>
                        <p className="mt-3 text-xs font-medium text-primary">Ruolo: {group.role}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState title="Nessun gruppo" message="I gruppi sono opzionali: creali quando vuoi riusare lo stesso insieme di persone." />
          )}
        </section>
        <CreateGroupForm />
      </div>
      <div className="mt-6">
        <Button asChild href="/nuova-attivita" variant="secondary">Crea ritrovo personale</Button>
      </div>
    </>
  );
}
