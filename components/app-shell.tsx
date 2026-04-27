import Link from "next/link";
import { CalendarDays, Home, LogOut, PlusCircle, Settings, Sparkles, UsersRound } from "lucide-react";
import { logoutAction } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";
import type { Workspace } from "@/lib/workspace";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/attivita", label: "Attivita", icon: CalendarDays },
  { href: "/nuova-attivita", label: "Crea", icon: PlusCircle },
  { href: "/assistente", label: "AI", icon: Sparkles },
  { href: "/impostazioni/gruppo", label: "Gruppo", icon: Settings }
];

export function AppShell({ children, workspace }: { children: React.ReactNode; workspace: Workspace }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[18rem_1fr]">
      <aside className="hidden border-r bg-white/82 p-5 lg:block">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white">
            <UsersRound className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">Ritrovo</p>
            <p className="text-xs text-muted-foreground">{workspace.group.name}</p>
          </div>
        </Link>
        <nav className="mt-8 space-y-1">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-sm font-semibold">{workspace.organization.name}</p>
              <p className="text-xs text-muted-foreground">Ruolo: {workspace.role}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild href="/nuova-attivita" size="sm" className="hidden sm:inline-flex">
                Nuova attivita
              </Button>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                {initials(workspace.profile?.full_name || workspace.user.email)}
              </div>
              <form action={logoutAction}>
                <Button size="icon" variant="ghost" aria-label="Esci">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:hidden">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="flex min-w-fit items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted">
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
