"use client";

import { useMemo, useState } from "react";
import { Bell, BriefcaseBusiness, Camera, Check, Globe2, LockKeyhole, Mail, MapPin, RotateCcw, Save, Shield, UserCircle, X } from "lucide-react";
import { logoutAction } from "@/app/auth/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { cn, initials } from "@/lib/utils";

type ProfileType = "Privato" | "Azienda" | "Organizzazione";

type ProfileFormValues = {
  displayName: string;
  email: string;
  avatarUrl: string;
  profileType: ProfileType;
  bio: string;
  area: string;
  phone: string;
  website: string;
  social: string;
  contactPerson: string;
  publicContact: string;
  notifications: {
    emailUpdates: boolean;
    rsvpReminders: boolean;
    activityUpdates: boolean;
    groupNotifications: boolean;
    publicActivityRequests: boolean;
    weeklyDigest: boolean;
  };
};

const notificationLabels: Array<{ key: keyof ProfileFormValues["notifications"]; label: string; help: string }> = [
  { key: "emailUpdates", label: "Ricevi aggiornamenti via email", help: "Inviti, risposte e novita importanti dell'account." },
  { key: "rsvpReminders", label: "Promemoria RSVP", help: "Ricordi prima delle scadenze o quando manca una risposta." },
  { key: "activityUpdates", label: "Aggiornamenti sui ritrovi", help: "Cambi di orario, luogo, note e sondaggi." },
  { key: "groupNotifications", label: "Notifiche dai gruppi", help: "Nuovi messaggi operativi e attivita nei gruppi." },
  { key: "publicActivityRequests", label: "Richieste sui ritrovi pubblici", help: "Predisposto per profili azienda, organizzazione e community." },
  { key: "weeklyDigest", label: "Riepilogo settimanale", help: "Un sommario leggero delle cose da seguire." }
];

function makeInitialValues(input: { displayName?: string | null; email?: string | null; avatarUrl?: string | null }): ProfileFormValues {
  return {
    displayName: input.displayName ?? "",
    email: input.email ?? "",
    avatarUrl: input.avatarUrl ?? "",
    profileType: "Privato",
    bio: "",
    area: "",
    phone: "",
    website: "",
    social: "",
    contactPerson: "",
    publicContact: "",
    notifications: {
      emailUpdates: true,
      rsvpReminders: true,
      activityUpdates: true,
      groupNotifications: true,
      publicActivityRequests: false,
      weeklyDigest: false
    }
  };
}

function Toggle({
  checked,
  disabled,
  label,
  help,
  onChange
}: {
  checked: boolean;
  disabled: boolean;
  label: string;
  help: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={cn("flex items-start justify-between gap-4 rounded-xl border bg-white p-3", disabled ? "opacity-80" : "cursor-pointer")}>
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">{help}</span>
      </span>
      <input type="checkbox" className="sr-only" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full border p-0.5 transition",
          checked ? "border-primary bg-primary" : "border-muted bg-muted"
        )}
      >
        <span className={cn("h-4 w-4 rounded-full bg-white shadow-sm transition", checked && "translate-x-5")} />
      </span>
    </label>
  );
}

export function ProfileForm({ displayName, email, avatarUrl }: { displayName?: string | null; email?: string | null; avatarUrl?: string | null }) {
  const initialValues = useMemo(() => makeInitialValues({ displayName, email, avatarUrl }), [avatarUrl, displayName, email]);
  const [savedValues, setSavedValues] = useState(initialValues);
  const [values, setValues] = useState(initialValues);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [uploadHint, setUploadHint] = useState<string | null>(null);

  const isOrganizationProfile = values.profileType === "Azienda" || values.profileType === "Organizzazione";
  const hasChanges = JSON.stringify(values) !== JSON.stringify(savedValues);
  const visibleName = values.displayName.trim() || "Nome profilo non impostato";
  const visibleEmail = values.email.trim() || "Email non disponibile";
  const visibleBio = values.bio.trim() || "Aggiungi una breve descrizione";
  const visibleArea = values.area.trim() || "Aggiungi citta o area";

  function updateField<K extends keyof ProfileFormValues>(field: K, value: ProfileFormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setMessage(null);
  }

  function updateNotification(key: keyof ProfileFormValues["notifications"], checked: boolean) {
    setValues((current) => ({
      ...current,
      notifications: { ...current.notifications, [key]: checked }
    }));
    setMessage(null);
  }

  function saveLocalChanges() {
    setSavedValues(values);
    setEditing(false);
    setMessage("Modifiche salvate in questa sessione. Il salvataggio permanente del profilo esteso e' predisposto lato UI.");
  }

  function cancelChanges() {
    setValues(savedValues);
    setEditing(false);
    setUploadHint(null);
    setMessage(null);
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/90">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-xl font-semibold text-secondary-foreground">
              {values.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={values.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span>{initials(visibleName)}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="break-words text-2xl font-semibold">{visibleName}</h2>
                <Badge className="bg-primary/10 text-primary">{values.profileType}</Badge>
              </div>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{visibleEmail}</span>
              </p>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{visibleArea}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            {editing ? (
              <>
                <Button type="button" variant="outline" onClick={cancelChanges}>
                  <X className="h-4 w-4" />
                  Annulla
                </Button>
                <Button type="button" disabled={!hasChanges} onClick={saveLocalChanges}>
                  <Save className="h-4 w-4" />
                  Salva modifiche
                </Button>
              </>
            ) : (
              <Button type="button" onClick={() => setEditing(true)}>
                <UserCircle className="h-4 w-4" />
                Modifica profilo
              </Button>
            )}
          </div>
        </div>
        {message ? <p className="mt-4 rounded-xl bg-primary/10 px-3 py-2 text-sm text-primary">{message}</p> : null}
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informazioni profilo</CardTitle>
            </CardHeader>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="displayName">{isOrganizationProfile ? "Nome azienda o organizzazione" : "Nome profilo"}</Label>
                <Input
                  id="displayName"
                  value={values.displayName}
                  disabled={!editing}
                  placeholder={isOrganizationProfile ? "Ritrovo Lab, associazione, brand..." : "Nome, nickname o nome visualizzato"}
                  onChange={(event) => updateField("displayName", event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email">Email account</Label>
                <Input id="email" type="email" value={visibleEmail} disabled aria-describedby="email-help" />
                <p id="email-help" className="mt-1.5 text-xs text-muted-foreground">
                  Email letta dalla autenticazione. La modifica non e attiva in questa schermata.
                </p>
              </div>
              <div>
                <Label htmlFor="profileType">Tipo profilo</Label>
                <Select
                  id="profileType"
                  value={values.profileType}
                  disabled={!editing}
                  onChange={(event) => updateField("profileType", event.target.value as ProfileType)}
                >
                  <option>Privato</option>
                  <option>Azienda</option>
                  <option>Organizzazione</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="area">Citta o area di riferimento</Label>
                <Input id="area" value={values.area} disabled={!editing} placeholder="Milano, Roma, Lago di Como..." onChange={(event) => updateField("area", event.target.value)} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="bio">{isOrganizationProfile ? "Descrizione pubblica" : "Bio o descrizione breve"}</Label>
                <Textarea
                  id="bio"
                  value={values.bio}
                  disabled={!editing}
                  placeholder={isOrganizationProfile ? "Racconta cosa organizzi e per chi." : "Aggiungi una breve descrizione per i tuoi gruppi."}
                  onChange={(event) => updateField("bio", event.target.value)}
                />
                {!values.bio && !editing ? <p className="mt-2 text-sm text-muted-foreground">{visibleBio}</p> : null}
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contatti opzionali</CardTitle>
            </CardHeader>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="phone">Telefono privato</Label>
                <Input id="phone" value={values.phone} disabled={!editing} placeholder="+39 333 000 0000" onChange={(event) => updateField("phone", event.target.value)} />
              </div>
              <div>
                <Label htmlFor="website">Sito web pubblico</Label>
                <Input id="website" type="url" value={values.website} disabled={!editing} placeholder="https://..." onChange={(event) => updateField("website", event.target.value)} />
              </div>
              <div>
                <Label htmlFor="social">Link social pubblico</Label>
                <Input id="social" value={values.social} disabled={!editing} placeholder="Instagram, LinkedIn, pagina community..." onChange={(event) => updateField("social", event.target.value)} />
              </div>
              <div>
                <Label htmlFor="publicContact">Contatto pubblico</Label>
                <Input id="publicContact" value={values.publicContact} disabled={!editing} placeholder="Email o telefono da mostrare pubblicamente" onChange={(event) => updateField("publicContact", event.target.value)} />
              </div>
              {isOrganizationProfile ? (
                <div className="md:col-span-2">
                  <Label htmlFor="contactPerson">Referente</Label>
                  <Input id="contactPerson" value={values.contactPerson} disabled={!editing} placeholder="Nome della persona referente" onChange={(event) => updateField("contactPerson", event.target.value)} />
                </div>
              ) : null}
            </div>
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-muted p-3 text-sm leading-6 text-muted-foreground">
              <Shield className="mt-1 h-4 w-4 shrink-0 text-primary" />
              Telefono ed email account restano dati privati. I campi indicati come pubblici sono predisposti per pagine e ritrovi visibili verso esterno.
            </p>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferenze di notifica</CardTitle>
            </CardHeader>
            <div className="grid gap-3">
              {notificationLabels.map((item) => (
                <Toggle
                  key={item.key}
                  checked={values.notifications[item.key]}
                  disabled={!editing}
                  label={item.label}
                  help={item.help}
                  onChange={(checked) => updateNotification(item.key, checked)}
                />
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Foto profilo o logo</CardTitle>
            </CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary font-semibold text-secondary-foreground">
                {values.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={values.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials(visibleName)
                )}
              </div>
              <div>
                <p className="text-sm font-medium">{isOrganizationProfile ? "Logo profilo" : "Foto profilo"}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Se manca una immagine, Ritrovo usa le iniziali come fallback.</p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="mt-4 w-full"
              disabled={!editing}
              onClick={() => setUploadHint("Upload reale non collegato: qui e' pronta la UI per connettere storage immagini.")}
            >
              <Camera className="h-4 w-4" />
              Carica immagine
            </Button>
            {uploadHint ? <p className="mt-3 text-sm text-muted-foreground">{uploadHint}</p> : null}
          </Card>

          {isOrganizationProfile ? (
            <Card className="border-primary/25 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BriefcaseBusiness className="h-5 w-5 text-primary" />
                  Profilo pubblico
                </CardTitle>
              </CardHeader>
              <p className="text-sm leading-6 text-muted-foreground">
                Questo profilo risulta predisposto per aziende, organizzazioni, community e attivita locali. Potrai creare ritrovi pubblici quando la funzione sara collegata.
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-primary">
                <Globe2 className="h-4 w-4" />
                Ritrovi pubblici in arrivo
              </div>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Gestione account</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <Button type="button" variant="outline" className="w-full justify-start" asChild href="/aggiorna-password">
                <LockKeyhole className="h-4 w-4" />
                Cambio password
              </Button>
              <Button type="button" variant="outline" className="w-full justify-start" disabled>
                <Mail className="h-4 w-4" />
                Modifica email in arrivo
              </Button>
              <form action={logoutAction}>
                <Button variant="ghost" className="w-full justify-start">
                  <RotateCcw className="h-4 w-4" />
                  Logout
                </Button>
              </form>
            </div>
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-muted p-3 text-sm leading-6 text-muted-foreground">
              <Bell className="mt-1 h-4 w-4 shrink-0 text-primary" />
              Eliminazione account e gestione dati personali richiedono un flusso sicuro dedicato prima di essere attivate.
            </p>
          </Card>

          {hasChanges && editing ? (
            <div className="flex items-center gap-2 rounded-2xl border bg-white p-4 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-primary" />
              Hai modifiche non salvate in questa sessione.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
