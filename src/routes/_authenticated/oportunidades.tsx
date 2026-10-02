import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/_authenticated/oportunidades")({
  head: () => ({ meta: [{ title: "Oportunidades — Clínica.AI" }] }),
  component: () => <PageHeader title="Oportunidades" subtitle="Em construção." />,
});
