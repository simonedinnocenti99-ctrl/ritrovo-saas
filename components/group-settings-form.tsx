"use client";

import { useActionState } from "react";
import { updateGroupAction } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import type { Group, Profile } from "@/lib/database.types";

export function GroupSettingsForm({ group }: { group: Group }) {
  const [state, action] = useActionState(updateGroupAction, null);
  return (
    <form action={action} className="rounded-2xl border bg-white p-5">
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

export function InviteMemberForm({ action }: { action: (formData: FormData) => void | Promise<void> }) {
  return (
    <form action={action} className="rounded-2xl border bg-white p-5">
      <h2 className="font-semibold">Invita membro</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_10rem_auto]">
        <Input name="email" type="email" placeholder="persona@email.it" required />
        <Select name="role" defaultValue="member">
          <option value="member">Member</option>
          <option value="admin">Admin</option>
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
            <div>
              <p className="font-medium">{member.profiles?.full_name || "Utente"}</p>
              <p className="text-sm text-muted-foreground">{member.user_id}</p>
            </div>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">{member.role}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
