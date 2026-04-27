import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Ritrovo | GatherLoop",
    template: "%s | Ritrovo"
  },
  description: "GatherLoop e una piattaforma privata per organizzare, pianificare e ricordare attivita di gruppo.",
  openGraph: {
    title: "Ritrovo | GatherLoop",
    description: "Il private event hub per gruppi, community e organizzatori.",
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
