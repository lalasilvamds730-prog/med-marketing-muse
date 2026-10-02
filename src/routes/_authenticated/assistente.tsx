import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/_authenticated/assistente")({
  head: () => ({ meta: [{ title: "Assistente IA — Clínica.AI" }] }),
  component: () => <PageHeader title="Assistente IA" subtitle="Em construção." />,
});
