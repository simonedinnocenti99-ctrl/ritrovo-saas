import Link from "next/link";
import { Building2, CalendarCheck, Camera, CheckCircle2, Dumbbell, Link2, MapPin, MessageCircleOff, Sparkles, Trophy, UsersRound, Utensils, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";

const benefits = [
  { icon: CalendarCheck, title: "Disponibilità e RSVP", text: "Raccogli disponibilità, conferma chi partecipa e chiudi le date senza rincorrere risposte." },
  { icon: Vote, title: "Sondaggi nel gruppo", text: "Scegliete date, luoghi, budget e attività con votazioni ordinate e sempre consultabili." },
  { icon: Link2, title: "Inviti facili", text: "Crea un ritrovo, condividi il link e porta le risposte nello stesso spazio del gruppo." },
  { icon: Camera, title: "Foto e ricordi", text: "Salva foto, note e decisioni per tenere memoria delle attività già vissute insieme." }
];

const steps = [
  {
    title: "Crea un gruppo o un ritrovo",
    text: "Imposta data, luogo, descrizione e dettagli utili per il tuo gruppo."
  },
  {
    title: "Condividi il link con i partecipanti",
    text: "Invialo via WhatsApp, email o dove preferisci, senza creare nuovi thread sparsi."
  },
  {
    title: "Raccogli RSVP, disponibilità, note e foto",
    text: "Risposte, sondaggi, decisioni e ricordi restano nello stesso spazio."
  }
];

const examples = [
  { icon: Dumbbell, title: "Trekking domenica mattina", text: "Proponi percorso, orario, punto di ritrovo e disponibilità del gruppo." },
  { icon: Utensils, title: "Cena di gruppo", text: "Raccogli RSVP, preferenze sul locale e note su allergie o prenotazioni." },
  { icon: Trophy, title: "Partita settimanale", text: "Conferma chi gioca, chi porta materiale e quando fissare il campo." },
  { icon: MapPin, title: "Weekend fuori porta", text: "Decidete data, budget, trasporti e salvate foto e note a fine viaggio." },
  { icon: UsersRound, title: "Team lunch", text: "Organizza pranzi, workshop leggeri e momenti interni senza rincorrere risposte." },
  { icon: Building2, title: "Evento pubblico locale", text: "Presenta attività aperte o private e gestisci le partecipazioni. Ritrovi pubblici in arrivo." }
];

const useCases = [
  {
    icon: UsersRound,
    title: "Per gruppi di amici",
    text: "Organizza cene, weekend, compleanni e uscite senza perdere messaggi nelle chat."
  },
  {
    icon: Dumbbell,
    title: "Per attività sportive",
    text: "Gestisci allenamenti, partite, trekking e disponibilità dei partecipanti."
  },
  {
    icon: Sparkles,
    title: "Per club e community",
    text: "Coordina eventi, incontri e attività ricorrenti della tua community."
  },
  {
    icon: CalendarCheck,
    title: "Per team e piccole organizzazioni",
    text: "Pianifica momenti di team building, pranzi, workshop o attività interne."
  },
  {
    icon: Building2,
    title: "Per aziende e attività locali",
    text: "Crea attività pubbliche o private e gestisci richieste di partecipazione."
  }
];

const professionalUses = [
  "Attività interne e momenti di team building",
  "Eventi ricorrenti con inviti condivisibili",
  "Gestione partecipazioni, RSVP e disponibilità",
  "Archivio di ritrovi, note, decisioni e foto",
  "Calendario e ritrovi pubblici come evoluzione futura"
];

export default function LandingPage() {
  return (
    <main>
      <section className="container-page grid min-h-[88vh] items-center gap-12 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
        <div>
          <p className="mb-4 inline-flex rounded-full border bg-white/70 px-3 py-1 text-sm font-medium text-primary shadow-sm">
            La social planning app privata per gruppi che si organizzano spesso
          </p>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-normal text-foreground sm:text-6xl">
            <span className="text-primary">Ritrovo</span> organizza ritrovi, disponibilità e ricordi dei tuoi gruppi.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Basta chat infinite: crea un ritrovo, condividi il link, raccogli RSVP e sondaggi,
            poi conserva foto, note e decisioni nello storico del gruppo.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/login">Crea il tuo primo ritrovo</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="#come-funziona">Scopri come funziona</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-[2rem] border bg-white/80 p-4 shadow-soft">
          <div className="rounded-[1.4rem] bg-gradient-to-br from-teal-800 via-violet-700 to-rose-400 p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-80">Gruppo Weekend</p>
                <h2 className="text-2xl font-semibold">Weekend al lago</h2>
              </div>
              <UsersRound className="h-7 w-7" />
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {["Invito condiviso", "6 RSVP confermati", "2 date disponibili", "Foto pronte in archivio"].map((item) => (
                <div key={item} className="rounded-xl bg-white/16 p-4 backdrop-blur">
                  <p className="text-sm font-medium">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-2xl bg-white p-4 text-foreground">
              <p className="text-sm font-semibold text-primary">Storico del gruppo</p>
              <p className="mt-2 text-sm text-muted-foreground">
                &quot;Date confermate, note del viaggio e foto restano qui, pronte per il prossimo ritrovo.&quot;
              </p>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {["Sondaggio data", "Note viaggio", "Album gruppo"].map((item) => (
                <div key={item} className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-medium">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="grid gap-8 rounded-2xl border bg-white/75 p-6 shadow-sm lg:grid-cols-[0.75fr_1fr] lg:p-8">
          <div>
            <MessageCircleOff className="h-7 w-7 text-primary" />
            <h2 className="mt-4 text-2xl font-semibold">Quando il gruppo vive solo in chat, le decisioni si perdono.</h2>
          </div>
          <p className="leading-7 text-muted-foreground">
            Date non confermate, sondaggi dispersi, persone che non rispondono, note introvabili e foto dimenticate nei messaggi:
            spesso l&apos;organizzazione resta sulle spalle di una sola persona. Ritrovo raccoglie ritrovi, inviti, RSVP,
            disponibilità, sondaggi, note e ricordi in uno spazio unico per tutto il gruppo.
          </p>
        </div>
      </section>

      <section id="come-funziona" className="container-page pb-20">
        <div className="mb-8 max-w-3xl">
          <h2 className="text-2xl font-semibold">Come funziona</h2>
          <p className="mt-4 leading-7 text-muted-foreground">
            Un flusso semplice per passare dall&apos;idea al ritrovo confermato, senza perdere pezzi nella chat.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <article key={step.title} className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-white">
                {index + 1}
              </div>
              <h3 className="mt-5 font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.text}</p>
            </article>
          ))}
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

      <section className="container-page pb-20">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold">Esempi di ritrovo</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Ritrovo funziona per attività piccole, ricorrenti o aperte: l&apos;importante è avere un gruppo da coordinare.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/registrati">Vedi un esempio</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {examples.map((example) => (
            <article key={example.title} className="rounded-2xl border bg-white/80 p-5 shadow-sm">
              <example.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-semibold">{example.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{example.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y bg-white/70 py-16">
        <div className="container-page">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold">Ideale per ogni tipo di gruppo</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Ritrovo è pensato per gruppi ricorrenti che devono decidere, invitare, raccogliere risposte e ricordare cosa è successo.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {useCases.map((useCase) => (
              <article key={useCase.title} className="rounded-2xl border bg-card p-5 shadow-sm">
                <useCase.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-4 font-semibold">{useCase.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{useCase.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-10 rounded-2xl border bg-white/75 p-6 shadow-sm lg:grid-cols-[0.9fr_1fr] lg:p-8">
          <div>
            <Building2 className="h-7 w-7 text-primary" />
            <h2 className="mt-4 text-2xl font-semibold">Anche per attività, community e aziende</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              Quando un gruppo ha appuntamenti ricorrenti, inviti da gestire e uno storico da tenere in ordine,
              Ritrovo aiuta anche team, piccole organizzazioni e attività locali a coordinarsi con meno messaggi.
            </p>
            <Button asChild className="mt-6">
              <Link href="/registrati">Organizza un gruppo</Link>
            </Button>
          </div>
          <div className="grid gap-3">
            {professionalUses.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-xl bg-muted/60 p-4 text-sm">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="grid gap-8 rounded-2xl border bg-primary p-6 text-white shadow-soft lg:grid-cols-[0.8fr_1fr] lg:p-8">
          <div>
            <MessageCircleOff className="h-7 w-7" />
            <h2 className="mt-4 text-2xl font-semibold">Le chat sono perfette per parlarne. Ritrovo serve per decidere.</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              "Data e partecipanti confermati",
              "Sondaggi e disponibilità ordinati",
              "Inviti condivisi con un link",
              "Note, foto e archivio del gruppo"
            ].map((item) => (
              <div key={item} className="rounded-xl bg-white/12 p-4 text-sm font-medium">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
