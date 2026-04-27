import { AIAssistant } from "@/components/ai-assistant";
import { PageHeader } from "@/components/page-header";

export default function AssistantPage() {
  return (
    <>
      <PageHeader title="Assistente AI" subtitle="Genera 3-5 idee partendo dallo storico del gruppo, dai vincoli e dal tipo di esperienza che vuoi proporre." />
      <AIAssistant />
    </>
  );
}
