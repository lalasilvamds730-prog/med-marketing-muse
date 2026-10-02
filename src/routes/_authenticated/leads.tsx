import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/_authenticated/leads")({
  head: () => ({ meta: [{ title: "Leads — Clínica.AI" }] }),
  component: () => <PageHeader title="Leads" subtitle="Em construção." />,
});
