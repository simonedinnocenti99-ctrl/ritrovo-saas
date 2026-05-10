"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown, ChevronUp, Plus, Settings, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type GroupPageShellProps = {
  groupId: string;
  groupName: string;
  groupDescription: string;
  canManageGroup: boolean;
  membersText: string;
  stats: ReactNode;
  membersPanel: ReactNode;
  invitePanel: ReactNode;
  settingsPanel: ReactNode;
  children: ReactNode;
};

export function GroupPageShell({
  groupId,
  groupName,
  groupDescription,
  canManageGroup,
  membersText,
  stats,
  membersPanel,
  invitePanel,
  settingsPanel,
  children
}: GroupPageShellProps) {
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [showInvitePanel, setShowInvitePanel] = useState(false);
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

  const toggleMembersPanel = useCallback(() => {
    setShowMembersPanel((current) => {
      if (!current) {
        scrollToSection("membri-gruppo");
      } else {
        setShowInvitePanel(false);
      }

      return !current;
    });
  }, [scrollToSection]);

  const toggleInvitePanel = useCallback(() => {
    setShowInvitePanel((current) => !current);
  }, []);

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
      {stats}
      <section className="mt-8">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-primary">
                <UsersRound className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium">Membri</p>
                <p className="mt-1 truncate text-sm leading-6 text-muted-foreground" title={membersText}>{membersText}</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleMembersPanel}
              aria-expanded={showMembersPanel}
              aria-controls="membri-gruppo"
              aria-label={showMembersPanel ? "Nascondi dettagli membri" : "Mostra dettagli membri"}
              title={showMembersPanel ? "Nascondi dettagli membri" : "Mostra dettagli membri"}
            >
              {showMembersPanel ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </Card>
      </section>
      {showMembersPanel ? (
        <section id="membri-gruppo" className="mt-4 scroll-mt-24">
          {membersPanel}
          {canManageGroup ? (
            <div className="mt-4 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={toggleInvitePanel}
                aria-expanded={showInvitePanel}
                aria-controls="inviti-gruppo"
                aria-label="Aggiungi membri"
                title="Aggiungi membri"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
          {showInvitePanel ? (
            <div id="inviti-gruppo" className="mt-4 grid gap-6 xl:grid-cols-[1fr_1fr]">
              {invitePanel}
            </div>
          ) : null}
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
