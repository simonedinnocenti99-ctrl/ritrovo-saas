type EmailResult =
  | { ok: true }
  | { ok: false; reason: "missing_config" | "provider_error"; message: string };

type GroupInviteEmail = {
  to: string;
  groupName: string;
  inviterName: string;
  token?: string | null;
};

type ActivityInviteEmail = {
  to: string;
  activityTitle: string;
  inviterName: string;
  startsAt?: string | null;
  locationName?: string | null;
  activityId: string;
};

const RESEND_API_URL = "https://api.resend.com/emails";

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

function fromAddress() {
  return process.env.EMAIL_FROM ?? "Ritrovo <onboarding@resend.dev>";
}

function isConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function textToHtml(text: string) {
  return text
    .split("\n")
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");
}

function formatDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Rome"
  }).format(date);
}

async function sendEmail({
  to,
  subject,
  text
}: {
  to: string;
  subject: string;
  text: string;
}): Promise<EmailResult> {
  if (!isConfigured()) {
    return {
      ok: false,
      reason: "missing_config",
      message: "RESEND_API_KEY non configurata."
    };
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "User-Agent": "ritrovo-saas/1.0"
    },
    body: JSON.stringify({
      from: fromAddress(),
      to,
      subject,
      text,
      html: textToHtml(text)
    })
  });

  if (!response.ok) {
    const message = await response.text();
    return {
      ok: false,
      reason: "provider_error",
      message: message || `Resend ha risposto con stato ${response.status}.`
    };
  }

  return { ok: true };
}

export async function sendGroupInviteEmail({
  to,
  groupName,
  inviterName,
  token
}: GroupInviteEmail): Promise<EmailResult> {
  const inviteUrl = token ? `${siteUrl()}/registrati?invite=${token}` : `${siteUrl()}/registrati`;
  return sendEmail({
    to,
    subject: `Invito al gruppo ${groupName} su Ritrovo`,
    text: [
      `Ciao,`,
      `${inviterName} ti ha invitato a entrare nel gruppo "${groupName}" su Ritrovo.`,
      `Apri questo link per creare o usare il tuo account: ${inviteUrl}`,
      `Se non ti aspettavi questo invito, puoi ignorare questa email.`
    ].join("\n\n")
  });
}

export async function sendActivityInviteEmail({
  to,
  activityTitle,
  inviterName,
  startsAt,
  locationName,
  activityId
}: ActivityInviteEmail): Promise<EmailResult> {
  const details = [
    `Ciao,`,
    `${inviterName} ti ha invitato al ritrovo "${activityTitle}" su Ritrovo.`,
    formatDate(startsAt) ? `Quando: ${formatDate(startsAt)}` : null,
    locationName ? `Dove: ${locationName}` : null,
    `Apri il ritrovo: ${siteUrl()}/attivita/${activityId}`,
    `Se non ti aspettavi questo invito, puoi ignorare questa email.`
  ].filter(Boolean);

  return sendEmail({
    to,
    subject: `Invito al ritrovo ${activityTitle}`,
    text: details.join("\n\n")
  });
}

export async function summarizeEmailResults(results: EmailResult[]) {
  const failures = results.filter((result) => !result.ok);
  if (!failures.length) return null;
  if (failures.some((failure) => failure.reason === "missing_config")) {
    return null;
  }
  return "Inviti salvati, ma alcune email non sono state inviate dal provider.";
}
