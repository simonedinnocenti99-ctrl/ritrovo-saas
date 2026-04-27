import { votePollAction } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Poll, PollOption, PollVote } from "@/lib/database.types";

export function PollCard({ activityId, poll, options, votes }: { activityId: string; poll: Poll; options: PollOption[]; votes: PollVote[] }) {
  const total = votes.filter((vote) => vote.poll_id === poll.id).length;
  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold">{poll.question}</h3>
        <Badge>{poll.status === "open" ? "Aperto" : "Chiuso"}</Badge>
      </div>
      <div className="mt-4 space-y-3">
        {options.map((option) => {
          const count = votes.filter((vote) => vote.option_id === option.id).length;
          const percent = total ? Math.round((count / total) * 100) : 0;
          return (
            <form key={option.id} action={votePollAction} className="grid gap-2">
              <input type="hidden" name="activityId" value={activityId} />
              <input type="hidden" name="pollId" value={poll.id} />
              <input type="hidden" name="optionId" value={option.id} />
              <div className="flex items-center justify-between gap-3 text-sm">
                <span>{option.label}</span>
                <span className="text-muted-foreground">{count} voti</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
                </div>
                <Button size="sm" variant="secondary" disabled={poll.status !== "open"}>Vota</Button>
              </div>
            </form>
          );
        })}
      </div>
    </div>
  );
}
