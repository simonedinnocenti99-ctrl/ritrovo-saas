import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { getCurrentWorkspace } from "@/lib/workspace";

export const metadata: Metadata = {
  robots: { index: false, follow: false }
};

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const workspace = await getCurrentWorkspace();
  return <AppShell workspace={workspace}>{children}</AppShell>;
}
