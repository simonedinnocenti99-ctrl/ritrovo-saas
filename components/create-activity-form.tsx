"use client";

import { useActionState, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Check,
  ChevronRight,
  Copy,
  Globe2,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Sparkles,
  Users
} from "lucide-react";
import { createActivityAction } from "@/app/(app)/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Group } from "@/lib/database.types";

type ActivityType = "personal" | "group" | "public";
type DateMode = "fixed" | "poll" | "options";
type LocationMode = "offline" | "online";

type FormErrors = Record<string, string>;

const categories = ["Cena", "Sport", "Trekking", "Viaggio", "Cultura", "Community", "Team", "Evento pubblico", "Altro"];

const templates = [
  { key: "cena", label: "Cena", category: "Cena", title: "Cena di gruppo", description: "Cena informale con persone invitate tramite link o contatti." },
  { key: "trekking", label: "Trekking", category: "Trekking", title: "Trekking domenica mattina", description: "Percorso semplice, punto di ritrovo da confermare e disponibilita da raccogliere." },
  { key: "sport", label: "Sport", category: "Sport", title: "Partita settimanale", description: "Ritrovo sportivo con conferma partecipanti e quota campo da definire." },
  { key: "viaggio", label: "Viaggio", category: "Viaggio", title: "Weekend fuori porta", description: "Proposta viaggio con budget stimato, luogo e date da finalizzare insieme." },
  { key: "compleanno", label: "Compleanno", category: "Cena", title: "Compleanno", description: "Festa con invitati, luogo e contributo da comunicare prima della conferma." },
  { key: "cultura", label: "Uscita culturale", category: "Cultura", title: "Uscita culturale", description: "Mostra, cinema o teatro con orario, biglietti e partecipanti da confermare." },
  { key: "team-lunch", label: "Team lunch", category: "Team", title: "Team lunch", description: "Pranzo di team con luogo, fascia oraria e partecipanti da invitare." },
  { key: "pubblico", label: "Evento pubblico", category: "Evento pubblico", title: "Evento pubblico", description: "Attivita aperta a richiesta di partecipazione, pensata per profili azienda o organizzazione." },
  { key: "community", label: "Community meetup", category: "Community", title: "Community meetup", description: "Incontro community con RSVP, link condivisione e capienza indicativa." }
];

const steps = [
  { key: "type", label: "Tipo", title: "Che tipo di ritrovo vuoi creare?" },
  { key: "base", label: "Base", title: "Informazioni base" },
  { key: "date", label: "Data", title: "Scegli una data oppure raccogli disponibilita" },
  { key: "place", label: "Luogo", title: "Dove si svolge" },
  { key: "invites", label: "Inviti", title: "Partecipanti e inviti" },
  { key: "budget", label: "Budget", title: "Budget e contributi" },
  { key: "privacy", label: "Privacy", title: "Privacy e condivisione" },
  { key: "summary", label: "Riepilogo", title: "Riepilogo e pubblicazione" }
] as const;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs font-medium text-destructive">{message}</p>;
}

function OptionButton({
  active,
  disabled,
  icon,
  title,
  description,
  onClick
}: {
  active?: boolean;
  disabled?: boolean;
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "min-h-32 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-60",
        active && "border-primary bg-primary/5 ring-2 ring-primary/15"
      )}
    >
      <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-primary">{icon}</span>
      <span className="block text-base font-semibold">{title}</span>
      <span className="mt-2 block text-sm leading-6 text-muted-foreground">{description}</span>
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm leading-6 text-foreground">{value || "Da completare"}</dd>
    </div>
  );
}

export function CreateActivityForm({ defaults, groups }: { defaults?: Record<string, string>; groups: Array<Group & { role: string }> }) {
  const [state, action, pending] = useActionState(createActivityAction, null);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FormErrors>({});
  const [activityType, setActivityType] = useState<ActivityType>(defaults?.group_id ? "group" : "personal");
  const [dateMode, setDateMode] = useState<DateMode>("fixed");
  const [locationMode, setLocationMode] = useState<LocationMode>("offline");
  const [template, setTemplate] = useState(defaults?.template ?? "");
  const [title, setTitle] = useState(defaults?.title ?? "");
  const [description, setDescription] = useState(defaults?.description ?? "");
  const [category, setCategory] = useState(defaults?.category ?? "Cena");
  const [groupId, setGroupId] = useState(defaults?.group_id ?? "personal");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [availabilityOne, setAvailabilityOne] = useState("");
  const [availabilityOneEnd, setAvailabilityOneEnd] = useState("");
  const [availabilityTwo, setAvailabilityTwo] = useState("");
  const [availabilityTwoEnd, setAvailabilityTwoEnd] = useState("");
  const [availabilityThree, setAvailabilityThree] = useState("");
  const [availabilityThreeEnd, setAvailabilityThreeEnd] = useState("");
  const [pollDeadline, setPollDeadline] = useState("");
  const [locationName, setLocationName] = useState(defaults?.location_name ?? "");
  const [locationAddress, setLocationAddress] = useState("");
  const [mapLink, setMapLink] = useState("");
  const [duration, setDuration] = useState(defaults?.duration ?? "");
  const [locationNotes, setLocationNotes] = useState("");
  const [participants, setParticipants] = useState("");
  const [budgetType, setBudgetType] = useState("tbd");
  const [budgetMin, setBudgetMin] = useState(defaults?.budget_min ?? "");
  const [budgetMax, setBudgetMax] = useState(defaults?.budget_max ?? "");
  const [currency, setCurrency] = useState("EUR");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [privacy, setPrivacy] = useState("link");
  const [recurrence, setRecurrence] = useState("once");
  const [maxParticipants, setMaxParticipants] = useState("");

  const selectedTemplate = useMemo(() => templates.find((item) => item.key === template), [template]);

  function applyTemplate(key: string) {
    const nextTemplate = templates.find((item) => item.key === key);
    setTemplate(key);
    if (!nextTemplate) return;
    setCategory(nextTemplate.category);
    if (!title) setTitle(nextTemplate.title);
    if (!description) setDescription(nextTemplate.description);
    if (key === "pubblico") {
      setActivityType("public");
      setPrivacy("public_request");
    }
  }

  function validateStep(index = step) {
    const nextErrors: FormErrors = {};
    if (index === 0 && !activityType) nextErrors.activity_type = "Scegli il tipo di ritrovo.";
    if (index === 1) {
      if (!title.trim()) nextErrors.title = "Inserisci un titolo.";
      if (activityType === "group" && groupId === "personal") nextErrors.group_id = "Scegli un gruppo.";
    }
    if (index === 2) {
      const dateValues = dateMode === "fixed" ? [startsAt] : [availabilityOne, availabilityTwo, availabilityThree].filter(Boolean);
      if (dateValues.length === 0 || !dateValues[0]) nextErrors.date = "Scegli una data o almeno una opzione sondaggio.";
      if (dateValues.some((value) => value && new Date(value).getTime() <= Date.now())) nextErrors.date = "Usa date future.";
    }
    if (index === 3 && locationMode === "offline" && !locationName.trim()) nextErrors.location_name = "Indica almeno un luogo o una zona.";
    if (index === 4) {
      const invalid = participants
        .split(/[\s,;]+/)
        .map((item) => item.trim())
        .filter((item) => item.includes("@"))
        .find((email) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
      if (invalid) nextErrors.participants = `Email non valida: ${invalid}`;
    }
    if (index === 5) {
      if (budgetMin && Number(budgetMin) < 0) nextErrors.budget_min = "Importo non valido.";
      if (budgetMax && Number(budgetMax) < 0) nextErrors.budget_max = "Importo non valido.";
      if (budgetMin && budgetMax && Number(budgetMin) > Number(budgetMax)) nextErrors.budget_max = "Il massimo deve essere maggiore o uguale al minimo.";
    }
    if (index === 6) {
      if (!privacy) nextErrors.privacy = "Scegli chi puo vedere il ritrovo.";
      if (maxParticipants && Number(maxParticipants) <= 0) nextErrors.max_participants = "Inserisci un numero valido.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function nextStep() {
    if (!validateStep()) return;
    setStep((current) => Math.min(current + 1, steps.length - 1));
    setErrors({});
  }

  function previousStep() {
    setStep((current) => Math.max(current - 1, 0));
    setErrors({});
  }

  function submitIsAllowed() {
    return steps.slice(0, -1).every((_, index) => validateStep(index));
  }

  const contextSummary = activityType === "group" ? groups.find((group) => group.id === groupId)?.name : activityType === "public" ? "Ritrovo pubblico (in arrivo)" : "Ritrovo personale";
  const dateSummary = dateMode === "fixed" ? startsAt : [availabilityOne, availabilityTwo, availabilityThree].filter(Boolean).join(", ");
  const budgetSummary = budgetType === "free" ? "Gratuito" : budgetType === "tbd" ? "Prezzo da definire" : [budgetMin, budgetMax].filter(Boolean).join(" - ");
  const inviteSummary = participants.trim() ? participants : activityType === "group" ? "Membri del gruppo e link invito dopo la creazione" : "Link invito generabile dopo la creazione";

  return (
    <form action={action} className="space-y-6" onSubmit={(event) => { if (!submitIsAllowed()) event.preventDefault(); }}>
      <input type="hidden" name="activity_type" value={activityType} />
      <input type="hidden" name="status" value={dateMode === "fixed" ? "scheduled" : "planning"} />
      <input type="hidden" name="date_mode" value={dateMode} />
      <input type="hidden" name="location_mode" value={locationMode} />
      <input type="hidden" name="template" value={template} />
      <input type="hidden" name="group_id" value={activityType === "group" ? groupId : "personal"} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="starts_at" value={startsAt} />
      <input type="hidden" name="ends_at" value={endsAt} />
      <input type="hidden" name="availability_1_start" value={availabilityOne} />
      <input type="hidden" name="availability_1_end" value={availabilityOneEnd} />
      <input type="hidden" name="availability_2_start" value={availabilityTwo} />
      <input type="hidden" name="availability_2_end" value={availabilityTwoEnd} />
      <input type="hidden" name="availability_3_start" value={availabilityThree} />
      <input type="hidden" name="availability_3_end" value={availabilityThreeEnd} />
      <input type="hidden" name="poll_deadline" value={pollDeadline} />
      <input type="hidden" name="location_name" value={locationName} />
      <input type="hidden" name="location_address" value={locationAddress} />
      <input type="hidden" name="map_link" value={mapLink} />
      <input type="hidden" name="duration" value={duration} />
      <input type="hidden" name="location_notes" value={locationNotes} />
      <input type="hidden" name="participants" value={participants} />
      <input type="hidden" name="budget_type" value={budgetType} />
      <input type="hidden" name="budget_min" value={budgetType === "free" || budgetType === "tbd" ? "" : budgetMin} />
      <input type="hidden" name="budget_max" value={budgetType === "free" || budgetType === "tbd" ? "" : budgetMax} />
      <input type="hidden" name="currency" value={currency} />
      <input type="hidden" name="payment_notes" value={paymentNotes} />
      <input type="hidden" name="privacy" value={privacy} />
      <input type="hidden" name="max_participants" value={maxParticipants} />
      <input type="hidden" name="recurrence" value={recurrence} />

      <nav className="overflow-x-auto rounded-2xl border bg-white p-2 shadow-sm" aria-label="Avanzamento creazione ritrovo">
        <ol className="flex min-w-max gap-1">
          {steps.map((item, index) => (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => setStep(index)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted",
                  index === step && "bg-primary text-primary-foreground hover:bg-primary",
                  index < step && "text-foreground"
                )}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full border text-xs">{index < step ? <Check className="h-3.5 w-3.5" /> : index + 1}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <section className="rounded-3xl border bg-white/86 p-5 shadow-sm md:p-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Passo {step + 1} di {steps.length}</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal">{steps[step].title}</h2>
          </div>
          {selectedTemplate ? <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground"><Sparkles className="h-4 w-4" /> Template: {selectedTemplate.label}</span> : null}
        </div>

        {step === 0 ? (
          <div className="space-y-6">
            <div>
              <Label htmlFor="template_picker">Template attivita</Label>
              <Select id="template_picker" value={template} onChange={(event) => applyTemplate(event.target.value)}>
                <option value="">Parti da zero</option>
                {templates.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
              </Select>
              <p className="mt-2 text-sm text-muted-foreground">I template precompilano categoria, titolo e descrizione. Puoi modificare tutto nei passi successivi.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <OptionButton active={activityType === "personal"} icon={<Lock className="h-5 w-5" />} title="Ritrovo personale" description="Un'attivita non collegata a un gruppo, ma con persone invitate tramite link o contatti." onClick={() => { setActivityType("personal"); setGroupId("personal"); setPrivacy("link"); }} />
              <OptionButton active={activityType === "group"} icon={<Users className="h-5 w-5" />} title="Ritrovo di gruppo" description="Un ritrovo collegato a uno dei tuoi gruppi, visibile ai membri e salvato nello storico del gruppo." onClick={() => { setActivityType("group"); setPrivacy("group_only"); }} />
              <OptionButton disabled active={activityType === "public"} icon={<Globe2 className="h-5 w-5" />} title="Ritrovo pubblico" description="Disponibile a breve per profili azienda o organizzazione. La UI e pronta, la pubblicazione pubblica non e ancora collegata." onClick={() => undefined} />
            </div>
            <FieldError message={errors.activity_type} />
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="lg:col-span-2">
              <Label htmlFor="title">Titolo ritrovo</Label>
              <Input id="title" required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Cena di gruppo" />
              <FieldError message={errors.title} />
            </div>
            <div className="lg:col-span-2">
              <Label htmlFor="description">Descrizione</Label>
              <Textarea id="description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Trekking domenica mattina con pranzo al sacco e rientro nel pomeriggio." />
            </div>
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select id="category" value={category} onChange={(event) => setCategory(event.target.value)}>
                {categories.map((item) => <option key={item}>{item}</option>)}
              </Select>
            </div>
            <div>
              <Label htmlFor="cover_hint">Copertina</Label>
              <Input id="cover_hint" disabled placeholder="Upload immagine in arrivo" />
              <p className="mt-2 text-xs leading-5 text-muted-foreground">Predisposizione UI: lo storage immagini resta quello gia usato nelle foto del dettaglio.</p>
            </div>
            {activityType === "group" ? (
              <div className="lg:col-span-2">
                <Label htmlFor="group_id">Gruppo associato</Label>
                <Select id="group_id" value={groupId} onChange={(event) => setGroupId(event.target.value)}>
                  <option value="personal">Scegli un gruppo</option>
                  {groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
                </Select>
                <FieldError message={errors.group_id} />
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-3">
              <OptionButton active={dateMode === "fixed"} icon={<CalendarClock className="h-5 w-5" />} title="Data gia definita" description="Hai gia giorno e orario del ritrovo." onClick={() => setDateMode("fixed")} />
              <OptionButton active={dateMode === "poll"} icon={<Users className="h-5 w-5" />} title="Sondaggio disponibilita" description="Raccogli disponibilita si/no/forse sul dettaglio ritrovo." onClick={() => setDateMode("poll")} />
              <OptionButton active={dateMode === "options"} icon={<CalendarClock className="h-5 w-5" />} title="Piu opzioni data" description="Proponi alternative e decidi dopo." onClick={() => setDateMode("options")} />
            </div>
            {dateMode === "fixed" ? (
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <Label htmlFor="starts_at">Data e ora inizio</Label>
                  <Input id="starts_at" type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} />
                </div>
                <div>
                  <Label htmlFor="ends_at">Data e ora fine opzionale</Label>
                  <Input id="ends_at" type="datetime-local" value={endsAt} onChange={(event) => setEndsAt(event.target.value)} />
                </div>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <Label htmlFor="availability_1_start">Opzione 1</Label>
                  <Input id="availability_1_start" type="datetime-local" value={availabilityOne} onChange={(event) => setAvailabilityOne(event.target.value)} />
                </div>
                <div>
                  <Label htmlFor="availability_1_end">Fine opzione 1</Label>
                  <Input id="availability_1_end" type="datetime-local" value={availabilityOneEnd} onChange={(event) => setAvailabilityOneEnd(event.target.value)} />
                </div>
                <div>
                  <Label htmlFor="availability_2_start">Opzione 2</Label>
                  <Input id="availability_2_start" type="datetime-local" value={availabilityTwo} onChange={(event) => setAvailabilityTwo(event.target.value)} />
                </div>
                <div>
                  <Label htmlFor="availability_2_end">Fine opzione 2</Label>
                  <Input id="availability_2_end" type="datetime-local" value={availabilityTwoEnd} onChange={(event) => setAvailabilityTwoEnd(event.target.value)} />
                </div>
                <div>
                  <Label htmlFor="availability_3_start">Opzione 3</Label>
                  <Input id="availability_3_start" type="datetime-local" value={availabilityThree} onChange={(event) => setAvailabilityThree(event.target.value)} />
                </div>
                <div>
                  <Label htmlFor="availability_3_end">Fine opzione 3</Label>
                  <Input id="availability_3_end" type="datetime-local" value={availabilityThreeEnd} onChange={(event) => setAvailabilityThreeEnd(event.target.value)} />
                </div>
                <div>
                  <Label htmlFor="poll_deadline">Scadenza sondaggio</Label>
                  <Input id="poll_deadline" type="datetime-local" value={pollDeadline} onChange={(event) => setPollDeadline(event.target.value)} />
                </div>
                <p className="text-sm leading-6 text-muted-foreground md:col-span-2">Le opzioni vengono salvate nelle disponibilita del ritrovo. Le risposte si/no/forse sono gia disponibili nella pagina dettaglio.</p>
              </div>
            )}
            <FieldError message={errors.date} />
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-2">
              <OptionButton active={locationMode === "offline"} icon={<MapPin className="h-5 w-5" />} title="Luogo fisico" description="Citta, area, locale o punto di incontro." onClick={() => setLocationMode("offline")} />
              <OptionButton active={locationMode === "online"} icon={<Globe2 className="h-5 w-5" />} title="Online" description="Videocall o link esterno da condividere con gli invitati." onClick={() => setLocationMode("online")} />
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <div>
                <Label htmlFor="location_name">{locationMode === "online" ? "Nome canale o piattaforma" : "Luogo o area"}</Label>
                <Input id="location_name" value={locationName} onChange={(event) => setLocationName(event.target.value)} placeholder={locationMode === "online" ? "Google Meet, Zoom, Discord" : "Parco Nord, Milano"} />
                <FieldError message={errors.location_name} />
              </div>
              <div>
                <Label htmlFor="location_address">{locationMode === "online" ? "Link videocall o link esterno" : "Indirizzo"}</Label>
                <Input id="location_address" value={locationAddress} onChange={(event) => setLocationAddress(event.target.value)} placeholder={locationMode === "online" ? "https://..." : "Via, citta o zona"} />
              </div>
              <div>
                <Label htmlFor="map_link">Link mappa</Label>
                <Input id="map_link" value={mapLink} onChange={(event) => setMapLink(event.target.value)} placeholder="Google Maps, Apple Maps o sito del luogo" />
              </div>
              <div>
                <Label htmlFor="duration">Durata stimata</Label>
                <Input id="duration" value={duration} onChange={(event) => setDuration(event.target.value)} placeholder="3 ore, 1 giorno, weekend" />
              </div>
              <div className="lg:col-span-2">
                <Label htmlFor="location_notes">Note sul luogo</Label>
                <Textarea id="location_notes" value={locationNotes} onChange={(event) => setLocationNotes(event.target.value)} placeholder="Indicazioni, parcheggio, punto preciso, cosa portare." />
              </div>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="lg:col-span-2 rounded-2xl border bg-muted/40 p-4">
              <div className="flex items-start gap-3">
                <Mail className="mt-1 h-5 w-5 text-primary" />
                <p className="text-sm leading-6 text-muted-foreground">
                  Invita persone anche senza creare un gruppo. Le email valide vengono salvate come inviti e ricevono il link; i nomi manuali vengono salvati come partecipanti invitati.
                </p>
              </div>
            </div>
            <div className="lg:col-span-2">
              <Label htmlFor="participants">Partecipanti da invitare</Label>
              <Textarea id="participants" value={participants} onChange={(event) => setParticipants(event.target.value)} placeholder="marta@email.it, Luca Rossi, giulia@email.it" />
              <FieldError message={errors.participants} />
            </div>
            {activityType === "group" ? (
              <div className="rounded-2xl border bg-white p-4 text-sm leading-6 text-muted-foreground">
                Selezione membri del gruppo predisposta: oggi il ritrovo viene collegato al gruppo e puoi aggiungere invitati specifici qui sopra.
              </div>
            ) : null}
            {activityType === "public" ? (
              <div className="rounded-2xl border bg-white p-4 text-sm leading-6 text-muted-foreground">
                Per i ritrovi pubblici sara disponibile l&apos;invito aperto con approvazione. La pubblicazione pubblica non e ancora collegata al backend.
              </div>
            ) : null}
            <div className="rounded-2xl border bg-white p-4 text-sm leading-6 text-muted-foreground">
              <div className="mb-2 flex items-center gap-2 font-medium text-foreground"><Copy className="h-4 w-4" /> Link invito</div>
              Il link viene generato dopo la creazione per le email invitate. Copia link e condivisione WhatsApp/Telegram sono predisposte nel flusso post-creazione.
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <Label htmlFor="budget_type">Tipo budget</Label>
              <Select id="budget_type" value={budgetType} onChange={(event) => setBudgetType(event.target.value)}>
                <option value="free">Gratuito</option>
                <option value="per_person">Quota prevista per persona</option>
                <option value="estimated">Budget stimato</option>
                <option value="contribution">Contributo richiesto</option>
                <option value="tbd">Prezzo da definire</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="currency">Valuta</Label>
              <Select id="currency" value={currency} onChange={(event) => setCurrency(event.target.value)}>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="budget_min">Importo minimo</Label>
              <Input id="budget_min" type="number" min="0" value={budgetMin} onChange={(event) => setBudgetMin(event.target.value)} placeholder="15" disabled={budgetType === "free" || budgetType === "tbd"} />
              <FieldError message={errors.budget_min} />
            </div>
            <div>
              <Label htmlFor="budget_max">Importo massimo</Label>
              <Input id="budget_max" type="number" min="0" value={budgetMax} onChange={(event) => setBudgetMax(event.target.value)} placeholder="30" disabled={budgetType === "free" || budgetType === "tbd"} />
              <FieldError message={errors.budget_max} />
            </div>
            <div className="lg:col-span-2">
              <Label htmlFor="payment_notes">Note sul pagamento</Label>
              <Textarea id="payment_notes" value={paymentNotes} onChange={(event) => setPaymentNotes(event.target.value)} placeholder="Da pagare sul posto, anticipo esterno, link pagamento o dettagli da definire." />
            </div>
          </div>
        ) : null}

        {step === 6 ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <Label htmlFor="privacy">Privacy</Label>
              <Select id="privacy" value={privacy} onChange={(event) => setPrivacy(event.target.value)}>
                {activityType === "personal" ? (
                  <>
                    <option value="private">Privato</option>
                    <option value="link">Accessibile con link</option>
                    <option value="invited">Solo invitati specifici</option>
                  </>
                ) : null}
                {activityType === "group" ? (
                  <>
                    <option value="group_only">Solo membri del gruppo</option>
                    <option value="group_link">Membri + invitati con link</option>
                    <option value="admin_approval">Richiede approvazione organizzatore</option>
                  </>
                ) : null}
                {activityType === "public" ? (
                  <>
                    <option value="public_request">Pubblico con richiesta di partecipazione</option>
                    <option value="public_rsvp">Pubblico con RSVP libero</option>
                  </>
                ) : null}
              </Select>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {activityType === "personal" ? "Chi ha il link puo visualizzare e rispondere." : activityType === "group" ? "Solo i membri del gruppo possono vedere questo ritrovo, salvo link agli invitati." : "Gli utenti potranno richiedere di partecipare."}
              </p>
              <FieldError message={errors.privacy} />
            </div>
            <div>
              <Label htmlFor="max_participants">Numero massimo partecipanti</Label>
              <Input id="max_participants" type="number" min="1" value={maxParticipants} onChange={(event) => setMaxParticipants(event.target.value)} placeholder="20" />
              <FieldError message={errors.max_participants} />
            </div>
            <div>
              <Label htmlFor="recurrence">Ricorrenza</Label>
              <Select id="recurrence" value={recurrence} onChange={(event) => setRecurrence(event.target.value)}>
                <option value="once">Una volta</option>
                <option value="weekly">Ogni settimana</option>
                <option value="biweekly">Ogni due settimane</option>
                <option value="monthly">Ogni mese</option>
                <option value="custom">Personalizzato</option>
              </Select>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Le ricorrenze sono predisposte nel riepilogo, senza creare serie automatiche.</p>
            </div>
            <div className="rounded-2xl border bg-white p-4 text-sm leading-6 text-muted-foreground">
              Lista d&apos;attesa e approvazioni pubbliche sono pronte come direzione UI. Servira collegarle a permessi e richieste partecipazione.
            </div>
          </div>
        ) : null}

        {step === 7 ? (
          <div className="space-y-5">
            <dl className="grid gap-3 md:grid-cols-2">
              <SummaryRow label="Tipo ritrovo" value={activityType === "personal" ? "Ritrovo personale" : activityType === "group" ? "Ritrovo di gruppo" : "Ritrovo pubblico"} />
              <SummaryRow label="Contesto" value={contextSummary || "Personale"} />
              <SummaryRow label="Titolo" value={title} />
              <SummaryRow label="Categoria" value={category} />
              <SummaryRow label="Data o sondaggio" value={dateSummary || (dateMode === "fixed" ? "Data definita" : "Sondaggio disponibilita")} />
              <SummaryRow label="Luogo" value={[locationName, locationAddress].filter(Boolean).join(", ")} />
              <SummaryRow label="Partecipanti e inviti" value={inviteSummary} />
              <SummaryRow label="Budget/prezzo" value={budgetSummary} />
              <SummaryRow label="Privacy" value={privacy} />
              <SummaryRow label="Dopo la creazione" value="Verrai portato al dettaglio ritrovo, dove potrai condividere inviti, gestire RSVP, disponibilita, note e foto." />
            </dl>
            <div className="rounded-2xl border bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">
              Collegato ora: ritrovo, gruppo, data fissa, opzioni disponibilita, luogo, budget, note e inviti via email/manuali. Predisposto UI: copertina, ritrovi pubblici, ricorrenze reali, copia link immediata e selezione membri del gruppo.
            </div>
          </div>
        ) : null}

        {state?.error ? <p className="mt-5 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{state.error}</p> : null}
      </section>

      <div className="sticky bottom-3 z-10 flex flex-col gap-3 rounded-2xl border bg-white/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="outline" onClick={previousStep} disabled={step === 0 || pending}>
          <ArrowLeft className="h-4 w-4" />
          Indietro
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row">
          {step === steps.length - 1 ? (
            <>
              <Button type="submit" name="status" value="draft" variant="outline" disabled={pending || activityType === "public"}>
                Salva come bozza
              </Button>
              <Button type="submit" name="status" value={dateMode === "fixed" ? "scheduled" : "planning"} size="lg" disabled={pending || activityType === "public"}>
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {activityType === "public" ? "Pubblica ritrovo pubblico" : participants.trim() ? "Crea e condividi" : "Crea ritrovo"}
              </Button>
            </>
          ) : (
            <Button type="button" size="lg" onClick={nextStep} disabled={pending}>
              Avanti
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <ChevronRight className="h-4 w-4" />
        Puoi arrivare al riepilogo anche con dati parziali, ma la creazione richiede tipo, titolo, data o disponibilita, luogo e privacy.
      </p>
    </form>
  );
}
