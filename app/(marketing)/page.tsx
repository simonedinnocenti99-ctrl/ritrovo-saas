import Link from "next/link";
import { CalendarCheck, Camera, Sparkles, UsersRound, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  { icon: CalendarCheck, title: "Pianificazione chiara", text: "Date, disponibilità, inviti e note restano nello stesso posto." },
  { icon: Vote, title: "Decisioni rapide", text: "Sondaggi integrati per scegliere attività, luoghi, budget e date." },
  { icon: Camera, title: "Memoria del gruppo", text: "Archivio con foto, timeline e dettagli degli eventi già vissuti." },
  { icon: Sparkles, title: "Idee con AI", text: "Suggerimenti strutturati usando storico, stagione, vincoli e preferenze." }
];

export default function LandingPage() {
  return (
    <main>
      <section className="container-page grid min-h-[88vh] items-center gap-12 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        <div>
          <p className="mb-4 inline-flex rounded-full border bg-white/70 px-3 py-1 text-sm font-medium text-primary shadow-sm">
            La tua social planning app privata, pronta a crescere in SaaS
          </p>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-normal text-foreground sm:text-6xl">
            <span className="text-primary">Ritrovo</span> organizza i tuoi momenti insieme e custodisce quelli che contano.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Ritrovo è il tuo hub privato per cene, weekend, eventi aziendali e community: inviti, disponibilità,
            sondaggi, foto e assistente AI in un flusso ordinato.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/login">Accedi</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/registrati">Registrati</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-[2rem] border bg-white/80 p-4 shadow-soft">
          <div className="rounded-[1.4rem] bg-gradient-to-br from-teal-800 via-violet-700 to-rose-400 p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Prossima attività</p>
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
                &quot;Avete scelto spesso luoghi raggiungibili in treno e budget medio. Propongo una giornata terme + cena.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <article
              key={benefit.title}
              className="group rounded-2xl border bg-card p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary/45 hover:bg-white hover:shadow-soft"
            >
              <benefit.icon className="h-6 w-6 text-primary transition group-hover:text-accent" />
              <h3 className="mt-5 font-semibold">{benefit.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{benefit.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y bg-white/70 py-16">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold">Per i tuoi gruppi di amici</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Coordina appuntamenti, disponibilità e decisioni condivise in uno spazio ordinato, riservato e sempre consultabile.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Per la tua azienda</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Gestisci iniziative interne, team building e community aziendali con ruoli, inviti, sondaggi, disponibilità e contenuti privati.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
