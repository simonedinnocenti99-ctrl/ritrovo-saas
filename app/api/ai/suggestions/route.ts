import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspace";
import type { Activity } from "@/lib/database.types";

const requestSchema = z.object({
  type: z.string().min(2),
  period: z.string().optional(),
  budget: z.string().optional(),
  duration: z.string().optional(),
  participants: z.string().optional(),
  constraints: z.string().optional(),
  tone: z.string().min(2)
});

const suggestionSchema = z.object({
  suggestions: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      reason: z.string(),
      category: z.string(),
      estimatedBudget: z.string(),
      duration: z.string(),
      bestPeriod: z.string(),
      requirements: z.array(z.string()),
      pollQuestions: z.array(z.string())
    })
  ).min(3).max(5)
});

function fallbackSuggestions(input: z.infer<typeof requestSchema>) {
  return {
    suggestions: [
      {
        title: `${input.type} con sondaggio leggero`,
        description: "Un piano semplice da decidere in gruppo, con due opzioni di data e una scelta sul luogo.",
        reason: "Uso un fallback strutturato per mantenere il flusso operativo anche senza risposta LLM.",
        category: input.type,
        estimatedBudget: input.budget || "Da definire",
        duration: input.duration || "Mezza giornata",
        bestPeriod: input.period || "Prossime settimane",
        requirements: ["Creare sondaggio data", "Raccogliere disponibilità", "Confermare partecipanti"],
        pollQuestions: ["Quale data preferisci?", "Che budget ti va bene?"]
      },
      {
        title: `Versione rilassata: ${input.type}`,
        description: "Formato amichevole con prenotazione flessibile e spazio per arrivare in momenti diversi.",
        reason: "Riduce attrito organizzativo e funziona bene per gruppi con disponibilità variabile.",
        category: input.type,
        estimatedBudget: input.budget || "Medio",
        duration: input.duration || "2-4 ore",
        bestPeriod: input.period || "Weekend",
        requirements: ["Lista partecipanti", "Luogo con prenotazione modificabile"],
        pollQuestions: ["Preferisci pranzo, pomeriggio o sera?"]
      },
      {
        title: `${input.type} premium ma sostenibile`,
        description: "Una proposta più curata, con una variante economica da mettere ai voti.",
        reason: "Permette al gruppo di scegliere il livello di spesa senza bloccare l'idea.",
        category: input.type,
        estimatedBudget: input.budget || "Variabile",
        duration: input.duration || "Una giornata",
        bestPeriod: input.period || "Quando ci sono più conferme",
        requirements: ["Due preventivi", "Sondaggio budget", "Conferma anticipo se serve"],
        pollQuestions: ["Meglio opzione economica o esperienza completa?"]
      }
    ]
  };
}

export async function POST(request: Request) {
  const input = requestSchema.parse(await request.json());
  const workspace = await getCurrentWorkspace();
  const supabase = await createClient();

  const { data: history } = await supabase
    .from("activities")
    .select("title,description,category,status,starts_at,location_name,budget_min,budget_max,duration")
    .eq("organization_id", workspace.organization.id)
    .eq("status", "completed")
    .order("starts_at", { ascending: false })
    .limit(20);

  const past = (history ?? []) as Pick<Activity, "title" | "description" | "category" | "status" | "starts_at" | "location_name" | "budget_min" | "budget_max" | "duration">[];
  const categoryCounts = past.reduce<Record<string, number>>((acc, activity) => {
    acc[activity.category] = (acc[activity.category] ?? 0) + 1;
    return acc;
  }, {});

  let output: z.infer<typeof suggestionSchema>;

  if (!process.env.LLM_API_KEY) {
    output = fallbackSuggestions(input);
  } else {
    try {
      const openai = new OpenAI({ apiKey: process.env.LLM_API_KEY });
      const response = await openai.chat.completions.create({
        model: process.env.LLM_MODEL || "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Sei l'assistente di Ritrovo. Genera solo JSON valido con suggestions: 3-5 idee in italiano, pratiche e coerenti con storico, stagione, budget, durata, vincoli e tono."
          },
          {
            role: "user",
            content: JSON.stringify({
              input,
              historySummary: {
                recentActivities: past.slice(0, 8),
                categoryCounts,
                averageKnownParticipants: "calcolabile in futuro da activity_participants"
              },
              outputShape: {
                suggestions: [
                  {
                    title: "string",
                    description: "string",
                    reason: "string",
                    category: "string",
                    estimatedBudget: "string",
                    duration: "string",
                    bestPeriod: "string",
                    requirements: ["string"],
                    pollQuestions: ["string"]
                  }
                ]
              }
            })
          }
        ]
      });
      output = suggestionSchema.parse(JSON.parse(response.choices[0]?.message.content ?? "{}"));
    } catch {
      output = fallbackSuggestions(input);
    }
  }

  await supabase.from("ai_suggestions").insert({
    organization_id: workspace.organization.id,
    group_id: workspace.groups[0]?.id ?? null,
    requested_by: workspace.user.id,
    input,
    output
  });

  return NextResponse.json(output);
}
