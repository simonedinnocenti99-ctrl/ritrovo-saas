import Link from "next/link";
import { LogOut, Settings, UserCircle, UsersRound } from "lucide-react";
import { logoutAction } from "@/app/auth/actions";
import { AppNavigation } from "@/components/app-navigation";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";
import type { Workspace } from "@/lib/workspace";

export function AppShell({ children, workspace }: { children: React.ReactNode; workspace: Workspace }) {
  const profileLabel = workspace.profile?.full_name || workspace.user.email || "Profilo";
  const avatarUrl = workspace.profile?.avatar_url;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[18rem_1fr]">
      <aside className="hidden border-r bg-white/82 p-5 lg:block">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white">
            <UsersRound className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">Ritrovo</p>
            <p className="text-xs text-muted-foreground">{workspace.organization.name}</p>
          </div>
        </Link>
        <AppNavigation />
      </aside>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div>
              <p className="text-sm font-semibold">{workspace.organization.name}</p>
              <p className="text-xs text-muted-foreground">Ruolo: {workspace.role}</p>
            </div>
            <div className="flex items-center gap-2">
              <details className="group relative">
                <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center overflow-hidden rounded-full bg-secondary text-sm font-semibold text-secondary-foreground transition hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <span className="sr-only">Apri menu utente</span>
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initials(profileLabel)
                  )}
                </summary>
                <div className="absolute right-0 mt-3 w-56 rounded-2xl border bg-white p-2 shadow-soft">
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-semibold">{profileLabel}</p>
                    <p className="text-xs text-muted-foreground">Profilo utente / azienda</p>
                  </div>
                  <Link href="/profilo" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium hover:bg-muted">
                    <UserCircle className="h-4 w-4" />
                    Profilo
                  </Link>
                  <Link href="/impostazioni" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium hover:bg-muted">
                    <Settings className="h-4 w-4" />
                    Impostazioni
                  </Link>
                  <form action={logoutAction}>
                    <Button size="sm" variant="ghost" className="mt-1 w-full justify-start px-3" aria-label="Esci">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </form>
                </div>
              </details>
            </div>
          </div>
          <AppNavigation mobile />
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
