import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false }
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="container-page flex min-h-screen items-center justify-center py-10">{children}</main>;
}
