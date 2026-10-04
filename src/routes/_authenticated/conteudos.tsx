import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { CrudPage } from "@/components/crud-page";
import { CONTEUDO_STATUS, CONTEUDO_TIPOS, formatDate } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/conteudos")({
  head: () => ({ meta: [{ title: "Conteúdos — Clínica.AI" }] }),
  component: ConteudosPage,
});

function ConteudosPage() {
  return (
    <CrudPage
      table="conteudos"
      title="Conteúdos"
      subtitle="Planeje as publicações da sua clínica."
      singular="conteúdo"
      newLabel="+ Novo Conteúdo"
      icon={<CalendarDays className="h-6 w-6" />}
      fields={[
        { name: "titulo", label: "Título", type: "text", required: true, full: true },
        { name: "tema", label: "Tema", type: "text" },
        { name: "tipo", label: "Tipo de conteúdo", type: "select", required: true, options: CONTEUDO_TIPOS.map((s) => ({ value: s, label: s })) },
        { name: "data_planejada", label: "Data planejada", type: "date" },
        { name: "status", label: "Status", type: "select", required: true, hideOnCreate: true, options: CONTEUDO_STATUS.map((s) => ({ value: s, label: s })) },
        { name: "observacoes", label: "Observações", type: "textarea" },
      ]}
      columns={[
        { label: "Título", render: (r) => r.titulo, primary: true },
        { label: "Tema", render: (r) => r.tema || "—" },
        { label: "Tipo", render: (r) => r.tipo },
        { label: "Data", render: (r) => formatDate(r.data_planejada) },
      ]}
      defaults={() => ({ status: "Ideia", tipo: "Post" })}
      searchKeys={["titulo", "tema"]}
      filters={[
        { name: "status", label: "Status", options: CONTEUDO_STATUS },
        { name: "tipo", label: "Tipo", options: CONTEUDO_TIPOS },
      ]}
      statusField="status"
      statusOptions={CONTEUDO_STATUS}
      describe={(r, prev) =>
        !prev ? `Novo conteúdo planejado: ${r.titulo}` : prev.status !== r.status ? `Conteúdo "${r.titulo}" mudou para "${r.status}"` : null
      }
    />
  );
}
