import { createFileRoute } from "@tanstack/react-router";
import { CheckSquare } from "lucide-react";
import { CrudPage } from "@/components/crud-page";
import { StatusBadge } from "@/components/status-badge";
import { PRIORIDADES, TAREFA_STATUS, formatDate } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/tarefas")({
  head: () => ({ meta: [{ title: "Tarefas — Clínica.AI" }] }),
  component: TarefasPage,
});

function TarefasPage() {
  return (
    <CrudPage
      table="tarefas"
      title="Tarefas"
      subtitle="Organize as atividades de marketing da equipe."
      singular="tarefa"
      newLabel="+ Nova Tarefa"
      icon={<CheckSquare className="h-6 w-6" />}
      fields={[
        { name: "titulo", label: "Título", type: "text", required: true, full: true },
        { name: "responsavel", label: "Responsável", type: "text" },
        { name: "prazo", label: "Prazo", type: "date" },
        { name: "prioridade", label: "Prioridade", type: "select", required: true, options: PRIORIDADES.map((s) => ({ value: s, label: s })) },
        { name: "status", label: "Status", type: "select", required: true, hideOnCreate: true, options: TAREFA_STATUS.map((s) => ({ value: s, label: s })) },
        { name: "descricao", label: "Descrição", type: "textarea" },
      ]}
      columns={[
        { label: "Título", render: (r) => r.titulo, primary: true },
        { label: "Responsável", render: (r) => r.responsavel || "—" },
        { label: "Prazo", render: (r) => formatDate(r.prazo) },
        { label: "Prioridade", render: (r) => <StatusBadge value={r.prioridade} /> },
      ]}
      defaults={() => ({ status: "Pendente", prioridade: "Média" })}
      searchKeys={["titulo", "responsavel", "descricao"]}
      filters={[
        { name: "prioridade", label: "Prioridade", options: PRIORIDADES },
        { name: "status", label: "Status", options: TAREFA_STATUS },
      ]}
      statusField="status"
      statusOptions={TAREFA_STATUS}
      highlight={(r) => r.prioridade === "Alta" && r.status !== "Concluída"}
      describe={(r, prev) =>
        !prev ? `Nova tarefa criada: ${r.titulo}` : prev.status !== r.status ? `Tarefa "${r.titulo}" mudou para "${r.status}"` : null
      }
    />
  );
}
