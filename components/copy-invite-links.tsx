"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Invitation } from "@/lib/database.types";

export function CopyInviteLinks({ invitations, baseUrl }: { invitations: Invitation[]; baseUrl: string }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!invitations.length) {
    return <p className="text-sm text-muted-foreground">Nessun invito in attesa.</p>;
  }

  async function copyLink(invitation: Invitation) {
    const link = `${baseUrl.replace(/\/$/, "")}/inviti/${invitation.token}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(invitation.id);
    window.setTimeout(() => setCopiedId(null), 1800);
  }

  return (
    <div className="space-y-3">
      {invitations.map((invitation) => (
        <div key={invitation.id} className="grid gap-2 rounded-xl border bg-muted/30 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{invitation.email}</p>
            <p className="truncate text-xs text-muted-foreground">{`${baseUrl.replace(/\/$/, "")}/inviti/${invitation.token}`}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => copyLink(invitation)}>
            {copiedId === invitation.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copiedId === invitation.id ? "Copiato" : "Copia"}
          </Button>
        </div>
      ))}
    </div>
  );
}
