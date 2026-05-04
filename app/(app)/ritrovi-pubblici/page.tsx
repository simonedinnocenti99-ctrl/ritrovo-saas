import { Compass, Search, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function PublicActivitiesPage() {
  return (
    <>
      <PageHeader
        title="Ritrovi pubblici"
        subtitle="Eventi visibili nella piattaforma, separati dai ritrovi personali e dai ritrovi privati dei gruppi."
        action={<Button variant="secondary">Scopri ritrovi</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Card className="bg-white/86">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold">In arrivo</h2>
                <Badge>Preparato</Badge>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                Qui potrai scoprire ritrovi pubblici creati da attivita, community e organizzazioni. Gli utenti potranno trovare attivita aperte e richiedere di partecipare.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader><CardTitle>Cosa ospitera</CardTitle></CardHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p className="flex gap-3"><Search className="h-4 w-4 shrink-0 text-primary" />Ricerca e filtri per luogo, categoria, data e disponibilita.</p>
            <p className="flex gap-3"><UserPlus className="h-4 w-4 shrink-0 text-primary" />Richieste di partecipazione verso profili azienda o organizzazione.</p>
          </div>
        </Card>
      </div>
    </>
  );
}
