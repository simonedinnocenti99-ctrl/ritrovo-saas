"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { deleteGroupAction, updateGroupAction } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import type { Group, Profile } from "@/lib/database.types";
import { normalizeGroupRole } from "@/lib/utils";

export function GroupSettingsForm({ group }: { group: Group }) {
  const [state, action] = useActionState(updateGroupAction, null);
  return (
    <form action={action} className="rounded-2xl border bg-white p-5">
      <input type="hidden" name="groupId" value={group.id} />
      <div>
        <Label htmlFor="name">Nome gruppo</Label>
        <Input id="name" name="name" defaultValue={group.name} required />
      </div>
      <div className="mt-4">
        <Label htmlFor="description">Descrizione</Label>
        <Textarea id="description" name="description" defaultValue={group.description ?? ""} />
      </div>
      {state?.error ? <p className="mt-3 text-sm text-destructive">{state.error}</p> : null}
      {state?.success ? <p className="mt-3 text-sm text-primary">{state.success}</p> : null}
      <Button className="mt-5">Salva modifiche</Button>
    </form>
  );
}

export function DeleteGroupForm({ group }: { group: Group }) {
  return (
    <form
      action={deleteGroupAction}
      className="rounded-2xl border border-destructive/30 bg-white p-5"
      onSubmit={(event) => {
        if (!window.confirm(`Eliminare definitivamente il gruppo "${group.name}"? Questa azione rimuove anche ritrovi, inviti e contenuti collegati.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="groupId" value={group.id} />
      <h2 className="font-semibold text-destructive">Elimina gruppo</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Questa azione e definitiva e rimuove il gruppo con le informazioni collegate.
      </p>
      <Button className="mt-5" variant="destructive">
        <Trash2 className="h-4 w-4" />
        Elimina gruppo
      </Button>
    </form>
  );
}

export function InviteMemberForm({ action, groupId }: { action: (formData: FormData) => void | Promise<void>; groupId: string }) {
  return (
    <form action={action} className="rounded-2xl border bg-white p-5">
      <input type="hidden" name="groupId" value={groupId} />
      <h2 className="font-semibold">Inviti</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_10rem_auto]">
        <Input name="email" type="email" placeholder="persona@email.it" required />
        <Select name="role" defaultValue="member">
          <option value="member">member</option>
          <option value="guest">guest</option>
        </Select>
        <Button>Invita</Button>
      </div>
    </form>
  );
}

export function MembersList({ members }: { members: Array<{ id: string; role: string; user_id: string; profiles: Profile | null }> }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <h2 className="font-semibold">Membri</h2>
      <div className="mt-4 divide-y">
        {members.map((member) => (
          <div key={member.id} className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0">
              <p className="font-medium">{member.profiles?.full_name || "Utente"}</p>
              <p className="truncate text-sm text-muted-foreground">{member.user_id}</p>
            </div>
            <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium">{normalizeGroupRole(member.role)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
