import Link from "next/link";
import { CalendarCheck, Camera, Sparkles, UsersRound, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  { icon: CalendarCheck, title: "Pianificazione chiara", text: "Date, disponibilita, inviti e note restano nello stesso posto." },
  { icon: Vote, title: "Decisioni rapide", text: "Sondaggi integrati per scegliere attivita, luoghi, budget e date." },
  { icon: Camera, title: "Memoria del gruppo", text: "Archivio con foto, timeline e dettagli degli eventi gia vissuti." },
  { icon: Sparkles, title: "Idee con AI", text: "Suggerimenti strutturati usando storico, stagione, vincoli e preferenze." }
];

export default function LandingPage() {
  return (
    <main>
      <section className="container-page grid min-h-[88vh] items-center gap-12 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        <div>
          <p className="mb-4 inline-flex rounded-full border bg-white/70 px-3 py-1 text-sm font-medium text-primary shadow-sm">
            Social planning app privata, pronta a crescere in SaaS
          </p>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-normal text-foreground sm:text-6xl">
            GatherLoop organizza il prossimo ritrovo e custodisce quelli passati.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Ritrovo e il tuo hub privato per cene, weekend, eventi aziendali e community: inviti, disponibilita,
            sondaggi, foto e assistente AI in un flusso ordinato.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/registrati">Crea il tuo gruppo</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Accedi</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-[2rem] border bg-white/80 p-4 shadow-soft">
          <div className="rounded-[1.4rem] bg-gradient-to-br from-teal-800 via-violet-700 to-rose-400 p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Prossima attivita</p>
                <h2 className="text-2xl font-semibold">Weekend al lago</h2>
              </div>
              <UsersRound className="h-7 w-7" />
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {["6 confermati", "2 date in ballottaggio", "3 sondaggi aperti", "Foto post-evento abilitate"].map((item) => (
                <div key={item} className="rounded-xl bg-white/16 p-4 backdrop-blur">
                  <p className="text-sm font-medium">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-2xl bg-white p-4 text-foreground">
              <p className="text-sm font-semibold text-primary">Suggerimento AI</p>
              <p className="mt-2 text-sm text-muted-foreground">
                “Avete scelto spesso luoghi raggiungibili in treno e budget medio. Propongo una giornata terme + cena.”
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <article key={benefit.title} className="rounded-2xl border bg-card p-6 shadow-sm">
              <benefit.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-5 font-semibold">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{benefit.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y bg-white/70 py-16">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold">Per gruppi di amici</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Tieni traccia delle cose fatte, decidi insieme la prossima uscita e recupera foto e ricordi senza cercare
              messaggi sparsi in chat diverse.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Per organizzatori di eventi</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              La stessa architettura multi-organizzazione supporta community, aziende e clienti SaaS con ruoli,
              inviti, sondaggi, disponibilita e contenuti privati.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
