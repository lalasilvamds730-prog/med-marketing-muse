import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Clínica.AI" }] }),
  component: () => <PageHeader title="Dashboard" subtitle="Em construção." />,
});
