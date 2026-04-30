import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AISuggestion } from "@/lib/database.types";

export function AISuggestionCard({ suggestion }: { suggestion: AISuggestion }) {
  const params = new URLSearchParams({
    title: suggestion.title,
    description: suggestion.description,
    category: suggestion.category,
    budget_min: suggestion.estimatedBudget.match(/\d+/)?.[0] ?? "",
    duration: suggestion.duration
  });

  return (
    <Card>
      <div className="flex items-start gap-3">
        <Sparkles className="mt-1 h-5 w-5 text-accent" />
        <div>
          <h3 className="text-lg font-semibold">{suggestion.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{suggestion.description}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
        <p><span className="font-medium text-foreground">Budget:</span> {suggestion.estimatedBudget}</p>
        <p><span className="font-medium text-foreground">Durata:</span> {suggestion.duration}</p>
        <p><span className="font-medium text-foreground">Periodo:</span> {suggestion.bestPeriod}</p>
        <p><span className="font-medium text-foreground">Categoria:</span> {suggestion.category}</p>
      </div>
      <p className="mt-4 text-sm leading-6"><span className="font-medium">Perché:</span> {suggestion.reason}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm font-medium">Da preparare</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
            {suggestion.requirements.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium">Domande sondaggio</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
            {suggestion.pollQuestions.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </div>
      <Button asChild variant="secondary" className="mt-5">
        <Link href={`/nuova-attivita?${params.toString()}`}>Trasforma in bozza</Link>
      </Button>
    </Card>
  );
}
