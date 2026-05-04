import { Bell, LockKeyhole, Settings } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentWorkspace } from "@/lib/workspace";

export default async function SettingsPage() {
  const workspace = await getCurrentWorkspace();

  return (
    <>
      <PageHeader
        title="Impostazioni"
        subtitle="Preferenze generali del workspace e scorciatoie verso le impostazioni dei singoli gruppi."
      />

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Workspace</CardTitle></CardHeader>
          <p className="flex items-center gap-2 text-sm font-medium">
            <Settings className="h-4 w-4 text-primary" />
            {workspace.organization.name}
          </p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Impostazioni organizzative leggere, pronte per essere estese senza cambiare la navigazione.</p>
        </Card>
        <Card>
          <CardHeader><CardTitle>Notifiche</CardTitle></CardHeader>
          <p className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
            <Bell className="mt-1 h-4 w-4 shrink-0 text-primary" />
            Preferenze su inviti, RSVP, sondaggi e promemoria saranno configurabili qui.
          </p>
        </Card>
        <Card>
          <CardHeader><CardTitle>Accesso e privacy</CardTitle></CardHeader>
          <p className="flex items-start gap-2 text-sm leading-6 text-muted-foreground">
            <LockKeyhole className="mt-1 h-4 w-4 shrink-0 text-primary" />
            Area predisposta per opzioni account, sicurezza e visibilita dei ritrovi pubblici.
          </p>
        </Card>
      </div>
    </>
  );
}
