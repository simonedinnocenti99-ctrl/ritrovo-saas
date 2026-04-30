import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Ritrovo",
    template: "%s | Ritrovo"
  },
  description: "Ritrovo è una piattaforma privata per organizzare, pianificare e ricordare attività di gruppo.",
  openGraph: {
    title: "Ritrovo",
    description: "La social planning app privata per gruppi, community e aziende.",
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
