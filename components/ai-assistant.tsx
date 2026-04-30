"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { AISuggestionCard } from "@/components/ai-suggestion-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import type { AISuggestion } from "@/lib/database.types";

export function AIAssistant() {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    const response = await fetch("/api/ai/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setLoading(false);
    if (!response.ok) {
      setError("Non sono riuscito a generare idee. Riprova tra poco.");
      return;
    }

    const data = await response.json();
    setSuggestions(data.suggestions ?? []);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[26rem_1fr]">
      <Card>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Tipo di attività</Label>
            <Input id="type" name="type" placeholder="Cena, weekend, sport, cultura" required />
          </div>
          <div>
            <Label htmlFor="period">Periodo</Label>
            <Input id="period" name="period" placeholder="Maggio, estate, venerdi sera" />
          </div>
          <div>
            <Label htmlFor="budget">Budget</Label>
            <Input id="budget" name="budget" placeholder="30-60 euro a persona" />
          </div>
          <div>
            <Label htmlFor="duration">Durata</Label>
            <Input id="duration" name="duration" placeholder="2 ore, mezza giornata, weekend" />
          </div>
          <div>
            <Label htmlFor="participants">Numero partecipanti</Label>
            <Input id="participants" name="participants" type="number" min="1" placeholder="8" />
          </div>
          <div>
            <Label htmlFor="tone">Tono</Label>
            <Select id="tone" name="tone" defaultValue="rilassata">
              {["rilassata", "avventurosa", "culturale", "sportiva", "economica", "premium"].map((tone) => <option key={tone}>{tone}</option>)}
            </Select>
          </div>
          <div>
            <Label htmlFor="constraints">Vincoli</Label>
            <Textarea id="constraints" name="constraints" placeholder="No auto, accessibile in treno, evitare posti rumorosi..." />
          </div>
          <Button disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Genera idee
          </Button>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </form>
      </Card>
      <div className="space-y-4">
        {suggestions.length ? suggestions.map((suggestion) => <AISuggestionCard key={suggestion.title} suggestion={suggestion} />) : (
          <Card className="flex min-h-64 items-center justify-center text-center text-sm text-muted-foreground">
            Le idee generate compariranno qui con motivazione, budget, materiali e domande per i sondaggi.
          </Card>
        )}
      </div>
    </div>
  );
}
