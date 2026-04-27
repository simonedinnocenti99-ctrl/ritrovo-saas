import { createPollAction, updateRsvpAction } from "@/app/(app)/actions";
import { ActivityDetailHeader } from "@/components/activity-detail-header";
import { AvailabilityPlanner } from "@/components/availability-planner";
import { MemberAvatarGroup } from "@/components/member-avatar-group";
import { PhotoGallery } from "@/components/photo-gallery";
import { PhotoUploader } from "@/components/photo-uploader";
import { PollCard } from "@/components/poll-card";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { getActivityDetail } from "@/lib/data";

export default async function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = await getActivityDetail(id);
  const names = detail.participants.map((participant) => participant.display_name || participant.email || "Invitato");

  return (
    <div className="space-y-6">
      <ActivityDetailHeader activity={detail.activity} />

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Disponibilita</CardTitle></CardHeader>
            <AvailabilityPlanner activityId={detail.activity.id} options={detail.availabilityOptions} responses={detail.availabilityResponses} />
          </Card>

          <Card>
            <CardHeader><CardTitle>Sondaggi</CardTitle></CardHeader>
            <form action={createPollAction} className="mb-5 grid gap-3 rounded-2xl border bg-muted/35 p-4">
              <input type="hidden" name="activityId" value={detail.activity.id} />
              <Label htmlFor="question">Domanda</Label>
              <Input id="question" name="question" placeholder="Quale ristorante preferisci?" required />
              <Label htmlFor="options">Opzioni, una per riga</Label>
              <Textarea id="options" name="options" placeholder={"Trattoria centro\nPizza gourmet\nSushi"} required />
              <Button variant="secondary">Crea sondaggio</Button>
            </form>
            <div className="space-y-4">
              {detail.polls.map((poll) => (
                <PollCard
                  key={poll.id}
                  activityId={detail.activity.id}
                  poll={poll}
                  options={detail.pollOptions.filter((option) => option.poll_id === poll.id)}
                  votes={detail.pollVotes.filter((vote) => vote.poll_id === poll.id)}
                />
              ))}
              {!detail.polls.length ? <p className="text-sm text-muted-foreground">Nessun sondaggio collegato.</p> : null}
            </div>
          </Card>

          {detail.activity.status === "completed" ? (
            <Card>
              <CardHeader><CardTitle>Foto evento</CardTitle></CardHeader>
              <PhotoUploader activityId={detail.activity.id} />
              <div className="mt-4"><PhotoGallery activityId={detail.activity.id} photos={detail.photos} /></div>
            </Card>
          ) : null}
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Partecipanti</CardTitle></CardHeader>
            <MemberAvatarGroup names={names.length ? names : ["Tu"]} />
            <div className="mt-5 grid gap-2">
              {["confirmed", "maybe", "declined"].map((status) => (
                <form key={status} action={updateRsvpAction}>
                  <input type="hidden" name="activityId" value={detail.activity.id} />
                  <input type="hidden" name="status" value={status} />
                  <Button className="w-full" variant={status === "confirmed" ? "default" : "outline"}>
                    {status === "confirmed" ? "Confermo" : status === "maybe" ? "Forse" : "Non partecipo"}
                  </Button>
                </form>
              ))}
            </div>
          </Card>
          <Card>
            <CardHeader><CardTitle>Note</CardTitle></CardHeader>
            <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{detail.activity.notes || "Nessuna nota interna."}</p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
