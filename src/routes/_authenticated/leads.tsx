import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { CrudPage } from "@/components/crud-page";
import { LEAD_STATUS, formatDate, today } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/leads")({
  head: () => ({ meta: [{ title: "Leads — Clínica.AI" }] }),
  component: LeadsPage,
});

function LeadsPage() {
  return (
    <CrudPage
      table="leads"
      title="Leads"
      subtitle="Cadastre e acompanhe os contatos interessados na sua clínica."
      singular="lead"
      newLabel="+ Novo Lead"
      icon={<Users className="h-6 w-6" />}
      fields={[
        { name: "nome", label: "Nome", type: "text", required: true },
        { name: "whatsapp", label: "WhatsApp", type: "tel", placeholder: "(00) 00000-0000" },
        { name: "email", label: "E-mail", type: "email" },
        { name: "servico", label: "Serviço de interesse", type: "text" },
        { name: "data_entrada", label: "Data de entrada", type: "date" },
        { name: "status", label: "Status", type: "select", required: true, hideOnCreate: true, options: LEAD_STATUS.map((s) => ({ value: s, label: s })) },
        { name: "observacoes", label: "Observações", type: "textarea" },
      ]}
      columns={[
        { label: "Nome", render: (r) => r.nome, primary: true },
        { label: "WhatsApp", render: (r) => r.whatsapp || "—" },
        { label: "Serviço", render: (r) => r.servico || "—" },
        { label: "Entrada", render: (r) => formatDate(r.data_entrada) },
      ]}
      defaults={() => ({ status: "Novo", data_entrada: today() })}
      searchKeys={["nome", "whatsapp", "email", "servico"]}
      filters={[{ name: "status", label: "Status", options: LEAD_STATUS }]}
      statusField="status"
      statusOptions={LEAD_STATUS}
      describe={(r, prev) =>
        !prev ? `Novo lead cadastrado: ${r.nome}` : prev.status !== r.status ? `Lead ${r.nome} mudou para "${r.status}"` : null
      }
    />
  );
}
