import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/_authenticated/tarefas")({
  head: () => ({ meta: [{ title: "Tarefas — Clínica.AI" }] }),
  component: () => <PageHeader title="Tarefas" subtitle="Em construção." />,
});
