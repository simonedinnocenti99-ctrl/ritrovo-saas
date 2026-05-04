import Link from "next/link";
import { UsersRound } from "lucide-react";
import { CreateGroupForm } from "@/components/create-group-form";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCurrentWorkspace } from "@/lib/workspace";

export default async function GroupsPage() {
  const workspace = await getCurrentWorkspace();

  return (
    <>
      <PageHeader
        title="Gruppi"
        subtitle="Spazi ricorrenti con membri, ritrovi, archivio e impostazioni. Usali quando organizzi spesso con le stesse persone."
        action={<Button asChild href="#crea-gruppo">Crea gruppo</Button>}
      />
      <section>
        {workspace.groups.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
          <EmptyState title="Nessun gruppo" message="Crea uno spazio privato quando vuoi organizzare spesso lo stesso insieme di persone." actionHref="#crea-gruppo" actionLabel="Crea gruppo" />
        )}
      </section>
      <section id="crea-gruppo" className="mt-8 scroll-mt-24">
        <CreateGroupForm />
      </section>
    </>
  );
}
