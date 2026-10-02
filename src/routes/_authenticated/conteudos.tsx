import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";

export const Route = createFileRoute("/_authenticated/conteudos")({
  head: () => ({ meta: [{ title: "Conteúdos — Clínica.AI" }] }),
  component: () => <PageHeader title="Conteúdos" subtitle="Em construção." />,
});
