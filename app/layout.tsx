import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Ritrovo",
    template: "%s | Ritrovo"
  },
  description: "Ritrovo organizza ritrovi, disponibilità, RSVP, sondaggi, note, foto e ricordi dei tuoi gruppi.",
  openGraph: {
    title: "Ritrovo",
    description: "La social planning app privata per organizzare attività e ricordi dei tuoi gruppi.",
    type: "website",
    locale: "it_IT"
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
