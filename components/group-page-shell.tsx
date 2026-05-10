"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Settings, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type GroupPageShellProps = {
  groupId: string;
  groupName: string;
  groupDescription: string;
  canManageGroup: boolean;
  membersText: string;
  membersPanel: ReactNode;
  settingsPanel: ReactNode;
  children: ReactNode;
};

export function GroupPageShell({
  groupId,
  groupName,
  groupDescription,
  canManageGroup,
  membersText,
  membersPanel,
  settingsPanel,
  children
}: GroupPageShellProps) {
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  const scrollToSection = useCallback((id: string) => {
    window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const openMembersPanel = useCallback(() => {
    setShowMembersPanel(true);
    scrollToSection("membri-gruppo");
  }, [scrollToSection]);

  const openSettingsPanel = useCallback(() => {
    setShowSettingsPanel(true);
    scrollToSection("impostazioni-gruppo");
  }, [scrollToSection]);

  useEffect(() => {
    if (window.location.hash === "#membri-gruppo") {
      openMembersPanel();
    }

    if (window.location.hash === "#impostazioni-gruppo") {
      openSettingsPanel();
    }

    const handleHashChange = () => {
      if (window.location.hash === "#membri-gruppo") {
        openMembersPanel();
      }

      if (window.location.hash === "#impostazioni-gruppo") {
        openSettingsPanel();
      }
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [openMembersPanel, openSettingsPanel]);

  return (
    <>
      <PageHeader
        title={groupName}
        subtitle={groupDescription}
        action={
          <div className="flex gap-2">
            {canManageGroup ? (
              <Button type="button" variant="outline" size="icon" onClick={openSettingsPanel} aria-label="Impostazioni gruppo" title="Impostazioni gruppo">
                <Settings className="h-4 w-4" />
              </Button>
            ) : null}
            <Button asChild href={`/nuova-attivita?group_id=${groupId}`}>Nuovo ritrovo</Button>
          </div>
        }
        breadcrumbs={[{ label: "Gruppi", href: "/gruppi" }, { label: groupName }]}
      />
      <div
        role="button"
        tabIndex={0}
        className="mb-6 cursor-pointer"
        onClick={openMembersPanel}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openMembersPanel();
          }
        }}
      >
        <Card className={cn("transition hover:-translate-y-0.5 hover:shadow-soft", showMembersPanel ? "border-primary/40" : null)}>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
              <UsersRound className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">Membri</p>
              <p className="mt-1 truncate text-sm leading-6 text-muted-foreground" title={membersText}>{membersText}</p>
            </div>
          </div>
        </Card>
      </div>
      {showMembersPanel ? (
        <section id="membri-gruppo" className="mb-8 scroll-mt-24">
          {membersPanel}
        </section>
      ) : null}
      {children}
      {showSettingsPanel ? (
        <section id="impostazioni-gruppo" className="mt-8 scroll-mt-24">
          {settingsPanel}
        </section>
      ) : null}
    </>
  );
}
