"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  BriefcaseBusiness,
  CalendarDays,
  Home,
  Settings,
  Sparkles,
  UserCircle,
  UsersRound
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/attivita", label: "Ritrovi", icon: CalendarDays },
  { href: "/gruppi", label: "Gruppi", icon: UsersRound },
  { href: "/ritrovi-pubblici", label: "Ritrovi pubblici", icon: BriefcaseBusiness },
  { href: "/archivio", label: "Archivio", icon: Archive },
  { href: "/assistente", label: "AI / Suggerimenti", icon: Sparkles },
  { href: "/profilo", label: "Profilo", icon: UserCircle },
  { href: "/impostazioni", label: "Impostazioni", icon: Settings }
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNavigation({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className={mobile ? "flex gap-1 overflow-x-auto px-3 pb-3 lg:hidden" : "mt-8 space-y-1"}>
      {nav.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              mobile && "min-w-fit py-2",
              active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
