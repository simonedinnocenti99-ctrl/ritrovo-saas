import { AIAssistant } from "@/components/ai-assistant";
import { PageHeader } from "@/components/page-header";

export default function AssistantPage() {
  return (
    <>
      <PageHeader
        title="AI / Suggerimenti"
        subtitle="Usa i suggerimenti per proporre idee, generare inviti, creare sondaggi, riassumere risposte e decidere la prossima azione utile."
      />
      <AIAssistant />
    </>
  );
}
