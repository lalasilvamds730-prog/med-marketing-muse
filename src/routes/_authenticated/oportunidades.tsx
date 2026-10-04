import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";
import { CrudPage } from "@/components/crud-page";
import { OPORTUNIDADE_STATUS, formatBRL, formatDate, today, useList, type Lead } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/oportunidades")({
  head: () => ({ meta: [{ title: "Oportunidades — Clínica.AI" }] }),
  component: OportunidadesPage,
});

function OportunidadesPage() {
  const { data: leads } = useList<Lead>("leads");
  const leadName = (id?: string | null) => leads?.find((l) => l.id === id)?.nome ?? "—";

  return (
    <CrudPage
      table="oportunidades"
      title="Oportunidades"
      subtitle="Acompanhe as negociações e o valor estimado."
      singular="oportunidade"
      newLabel="+ Nova Oportunidade"
      icon={<TrendingUp className="h-6 w-6" />}
      fields={[
        { name: "nome", label: "Nome da oportunidade", type: "text", required: true, full: true },
        { name: "lead_id", label: "Lead vinculado", type: "select", options: (leads ?? []).map((l) => ({ value: l.id, label: l.nome })) },
        { name: "servico", label: "Serviço", type: "text" },
        { name: "valor_estimado", label: "Valor estimado (R$)", type: "number" },
        { name: "data", label: "Data", type: "date" },
        { name: "status", label: "Status", type: "select", required: true, hideOnCreate: true, options: OPORTUNIDADE_STATUS.map((s) => ({ value: s, label: s })) },
        { name: "observacoes", label: "Observações", type: "textarea" },
      ]}
      columns={[
        { label: "Nome", render: (r) => r.nome, primary: true },
        { label: "Lead", render: (r) => leadName(r.lead_id) },
        { label: "Serviço", render: (r) => r.servico || "—" },
        { label: "Valor", render: (r) => formatBRL(Number(r.valor_estimado) || 0) },
        { label: "Data", render: (r) => formatDate(r.data), hideMobile: true },
      ]}
      defaults={() => ({ status: "Nova", data: today(), valor_estimado: 0 })}
      searchKeys={["nome", "servico"]}
      filters={[{ name: "status", label: "Status", options: OPORTUNIDADE_STATUS }]}
      statusField="status"
      statusOptions={OPORTUNIDADE_STATUS}
      validate={(v) => (v.data === null ? "Informe a data da oportunidade." : null)}
      describe={(r, prev) =>
        !prev ? `Nova oportunidade: ${r.nome}` : prev.status !== r.status ? `Oportunidade "${r.nome}" mudou para "${r.status}"` : null
      }
    />
  );
}
