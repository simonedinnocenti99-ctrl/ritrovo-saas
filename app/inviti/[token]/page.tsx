import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Invitation } from "@/lib/database.types";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/inviti/${token}`);
  }

  const admin = createAdminClient();
  const { data: invitation } = await admin.from("invitations").select("*").eq("token", token).single();

  if (!invitation || invitation.status !== "pending") {
    return (
      <div className="mx-auto mt-16 max-w-lg">
        <Card>
          <h1 className="text-xl font-semibold">Invito non disponibile</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Questo link non esiste, e scaduto oppure e gia stato usato.</p>
          <Button asChild href="/dashboard" className="mt-5">Vai alla dashboard</Button>
        </Card>
      </div>
    );
  }

  const invite = invitation as Invitation;
  if (user.email?.toLowerCase() !== invite.email.toLowerCase()) {
    return (
      <div className="mx-auto mt-16 max-w-lg">
        <Card>
          <h1 className="text-xl font-semibold">Email diversa</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Questo invito e per {invite.email}. Accedi o registrati con quell&apos;indirizzo per accettarlo.
          </p>
          <Link className="mt-5 inline-block text-sm font-medium text-primary" href={`/login?next=/inviti/${token}`}>
            Cambia account
          </Link>
        </Card>
      </div>
    );
  }

  await admin.from("organization_members").upsert(
    {
      organization_id: invite.organization_id,
      user_id: user.id,
      role: "member"
    },
    { onConflict: "organization_id,user_id" }
  );

  if (invite.group_id) {
    await admin.from("group_members").upsert(
      {
        group_id: invite.group_id,
        user_id: user.id,
        role: invite.role === "admin" ? "admin" : "member"
      },
      { onConflict: "group_id,user_id" }
    );
  }

  if (invite.activity_id) {
    await admin.from("activity_participants").upsert(
      {
        activity_id: invite.activity_id,
        user_id: user.id,
        email: invite.email,
        status: "invited"
      },
      { onConflict: "activity_id,user_id" }
    );
  }

  await admin.from("invitations").update({ status: "accepted" }).eq("id", invite.id);

  if (invite.group_id) redirect(`/gruppi/${invite.group_id}`);
  if (invite.activity_id) redirect(`/attivita/${invite.activity_id}`);
  redirect("/dashboard");
}
