import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Clínica.AI" }] }),
  component: () => <PageHeader title="Configurações" subtitle="Em construção." />,
});
