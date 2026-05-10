import Link from "next/link";
import { UsersRound } from "lucide-react";
import { GroupsPageShell } from "@/components/groups-page-shell";
import { EmptyState } from "@/components/states";
import { Card } from "@/components/ui/card";
import { enrichGroupsForList } from "@/lib/data";
import { normalizeGroupRole } from "@/lib/utils";
import { getCurrentWorkspace } from "@/lib/workspace";

export default async function GroupsPage() {
  const workspace = await getCurrentWorkspace();
  const groups = await enrichGroupsForList(workspace.groups);

  return (
    <GroupsPageShell>
      <section>
        {groups.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => (
              <Link key={group.id} href={`/gruppi/${group.id}`} className="block">
                <Card className="flex h-full flex-col gap-5 transition hover:-translate-y-0.5 hover:shadow-soft">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                      <UsersRound className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-semibold">{group.name}</h2>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{group.description || "Nessuna descrizione inserita."}</p>
                    </div>
                  </div>
                  <div className="mt-auto grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-xl bg-muted/60 p-3">
                      <p className="font-semibold text-foreground">{group.memberCount === 1 ? "\uD83D\uDC64" : "\uD83D\uDC65"} {group.memberCount}</p>
                      <p className="text-xs text-muted-foreground">Membri</p>
                    </div>
                    <div className="rounded-xl bg-muted/60 p-3">
                      <p className="font-semibold text-foreground">{group.activityCount ?? "-"}</p>
                      <p className="text-xs text-muted-foreground">Ritrovi</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-xs font-medium">
                    <span className="text-muted-foreground">Ruolo: {normalizeGroupRole(group.role)}</span>
                    <span className="text-primary">Apri gruppo</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="Nessun gruppo" message="Non hai ancora creato gruppi. Crea un nuovo gruppo per organizzare ritrovi, disponibilita e ricordi in uno spazio unico." actionHref="#crea-gruppo" actionLabel="Crea nuovo gruppo" />
        )}
      </section>
    </GroupsPageShell>
  );
}
