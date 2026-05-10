"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { CreateGroupForm } from "@/components/create-group-form";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

export function GroupsPageShell({ children }: { children: ReactNode }) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  const openCreateForm = useCallback(() => {
    setShowCreateForm(true);

    window.requestAnimationFrame(() => {
      document.getElementById("crea-gruppo")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  useEffect(() => {
    if (window.location.hash === "#crea-gruppo") {
      openCreateForm();
    }

    const handleHashChange = () => {
      if (window.location.hash === "#crea-gruppo") {
        openCreateForm();
      }
    };

    const handleCreateLinkClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const link = target?.closest<HTMLAnchorElement>('a[href="#crea-gruppo"]');

      if (!link) {
        return;
      }

      event.preventDefault();
      window.history.pushState(null, "", "#crea-gruppo");
      openCreateForm();
    };

    window.addEventListener("hashchange", handleHashChange);
    document.addEventListener("click", handleCreateLinkClick);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      document.removeEventListener("click", handleCreateLinkClick);
    };
  }, [openCreateForm]);

  return (
    <>
      <PageHeader
        title="Gruppi"
        subtitle="Spazi ricorrenti con membri, ritrovi, archivio e impostazioni. Usali quando organizzi spesso con le stesse persone."
        action={
          <Button type="button" onClick={openCreateForm}>
            Crea nuovo gruppo
          </Button>
        }
      />
      {children}
      {showCreateForm ? (
        <section id="crea-gruppo" className="mt-8 scroll-mt-24">
          <CreateGroupForm />
        </section>
      ) : null}
    </>
  );
}
