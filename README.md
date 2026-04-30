# Ritrovo / GatherLoop

GatherLoop e una piattaforma privata per organizzare, pianificare e ricordare attivita di gruppo. Questa base MVP e pensata per un gruppo di amici, ma usa fin dall inizio organizzazioni, gruppi, ruoli e Row Level Security per poter evolvere in SaaS per organizer, community e aziende.

## Stack

- Next.js App Router, React, TypeScript
- Tailwind CSS con componenti UI locali in stile shadcn
- Supabase Auth, PostgreSQL, Storage e RLS
- API server-side per assistente LLM
- Target deploy: Vercel

## Funzionalita incluse

- Landing pubblica in italiano con SEO base e Open Graph
- Registrazione, login, logout e recupero password Supabase
- Route private protette da middleware
- Onboarding automatico: prima organizzazione e gruppo creati al primo accesso
- Dashboard privata
- Archivio attivita con ricerca e filtri
- Creazione attivita con form validato server-side
- Dettaglio attivita con partecipanti, RSVP, note, sondaggi, disponibilita e foto
- Pianificatore disponibilita con riepilogo e migliore opzione
- Sondaggi associati ad attivita con voto e risultati
- Upload foto su Supabase Storage privato, caption ed eliminazione
- Assistente AI server-side con output JSON validato e fallback
- Impostazioni gruppo, inviti e lista membri
- Link invito copiabili per condividere accessi via WhatsApp, email personale o altri canali
- Schema multi-tenant con ruoli `owner`, `admin`, `member`, `guest`

## Setup locale

1. Installa dipendenze:

```bash
npm install
```

2. Copia le variabili ambiente:

```bash
cp .env.example .env.local
```

3. Configura `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
LLM_API_KEY=your-llm-api-key
LLM_MODEL=gpt-4o-mini
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=Ritrovo <inviti@your-domain.com>
```

`LLM_API_KEY` e opzionale in sviluppo: senza chiave l assistente restituisce un fallback strutturato.
`RESEND_API_KEY` ed `EMAIL_FROM` servono per inviare davvero le email di invito a gruppi e ritrovi. Senza queste variabili gli inviti vengono salvati nel database, ma il server restituisce un avviso per segnalare che la consegna email non e configurata.

### Email inviti

L'invio usa Resend tramite API HTTP server-side, senza dipendenze aggiuntive. Per attivarlo:

- crea un account Resend
- verifica un dominio mittente e configura i record DNS richiesti
- crea una API key
- imposta `RESEND_API_KEY` e `EMAIL_FROM` su `.env.local` e su Vercel

In sviluppo puoi usare temporaneamente il mittente di test di Resend, ma in produzione conviene usare un dominio verificato per migliorare recapito e reputazione.

4. Applica la migrazione Supabase:

```bash
supabase db push
```

Oppure incolla i file in `supabase/migrations` nel SQL editor del progetto Supabase, in ordine numerico.

5. Avvia Next.js:

```bash
npm run dev
```

## Configurazione Supabase

### Auth

- Abilita Email/Password in Supabase Auth.
- Imposta Site URL a `http://localhost:3000` in locale e al dominio Vercel in produzione.
- Aggiungi redirect URL:
  - `http://localhost:3000/auth/callback`
  - `https://tuo-dominio.vercel.app/auth/callback`

### Database

La migrazione crea:

- `profiles`
- `organizations`
- `organization_members`
- `groups`
- `group_members`
- `activities`
- `activity_participants`
- `activity_photos`
- `availability_options`
- `availability_responses`
- `polls`
- `poll_options`
- `poll_votes`
- `ai_suggestions`
- `invitations`

Include enum, foreign key, indici, trigger `updated_at`, funzioni helper per permessi e policy RLS.

### Storage

La migrazione crea il bucket privato `activity-photos` con:

- dimensione massima 5 MB
- MIME consentiti: JPEG, PNG, WebP, GIF
- policy per upload, lettura firmata e cancellazione autorizzata

## Seed demo

`supabase/seed.sql` contiene uno seed commentato. Crea prima un utente Auth, poi sostituisci `<USER_UUID>` con l UUID reale e lancia gli insert.

## Deploy Vercel

1. Importa il repository su Vercel.
2. Aggiungi le variabili ambiente di `.env.example`.
3. Configura Supabase Auth con il dominio Vercel.
4. Esegui il deploy.

Comandi utili:

```bash
npm run typecheck
npm run build
```

## Note architetturali

- Il client usa la anon key Supabase; la service role key resta disponibile solo lato server.
- Le pagine private hanno metadata `robots: noindex`.
- L assistente AI legge solo dati accessibili all utente corrente via RLS e salva input/output in `ai_suggestions`.
- Il modello dati include `billing_plan` su organizzazioni per agevolare piani e abbonamenti futuri senza implementare pagamenti nell MVP.
