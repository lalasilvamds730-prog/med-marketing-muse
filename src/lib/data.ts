import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type TableName = "leads" | "conteudos" | "tarefas" | "oportunidades" | "atividades";
export type Lead = Tables<"leads">;
export type Conteudo = Tables<"conteudos">;
export type Tarefa = Tables<"tarefas">;
export type Oportunidade = Tables<"oportunidades">;
export type Atividade = Tables<"atividades">;
export type Row = Record<string, any> & { id: string };

export const LEAD_STATUS = ["Novo", "Contato", "Agendado", "Convertido", "Perdido"];
export const CONTEUDO_STATUS = ["Ideia", "Planejado", "Publicado"];
export const CONTEUDO_TIPOS = ["Post", "Reels", "Stories", "Vídeo", "Artigo", "Campanha"];
export const TAREFA_STATUS = ["Pendente", "Em andamento", "Concluída"];
export const PRIORIDADES = ["Baixa", "Média", "Alta"];
export const OPORTUNIDADE_STATUS = ["Nova", "Em negociação", "Agendada", "Convertida", "Perdida"];

export function useList<T = Row>(table: TableName) {
  return useQuery({
    queryKey: [table],
    queryFn: async () => {
      const { data, error } = await (supabase.from(table) as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(table === "atividades" ? 12 : 1000);
      if (error) throw error;
      return (data ?? []) as T[];
    },
  });
}

export async function logActivity(descricao: string, tipo: string) {
  await supabase.from("atividades").insert({ descricao, tipo } as any);
}

export function useSave(table: TableName, describe: (row: any, prev?: any) => string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ values, prev }: { values: Record<string, any>; prev?: Row | undefined }) => {
      const q = supabase.from(table) as any;
      const { data, error } = prev
        ? await q.update(values).eq("id", prev.id).select().single()
        : await q.insert(values).select().single();
      if (error) throw error;
      const desc = describe(data, prev);
      if (desc) await logActivity(desc, table);
      return data as Row;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
      qc.invalidateQueries({ queryKey: ["atividades"] });
    },
    onError: (e: any) => toast.error("Não foi possível salvar: " + (e?.message ?? "erro desconhecido")),
  });
}

export function useRemove(table: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase.from(table) as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [table] });
      toast.success("Registro excluído com sucesso.");
    },
    onError: (e: any) => toast.error("Não foi possível excluir: " + (e?.message ?? "erro")),
  });
}

export const formatDate = (d?: string | null) =>
  d ? new Date(d.length === 10 ? d + "T12:00:00" : d).toLocaleDateString("pt-BR") : "—";
export const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const today = () => new Date().toISOString().slice(0, 10);

/** Insere dados de exemplo (clínica odontológica) para o usuário atual. */
export async function carregarExemplos() {
  const d = (n: number) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
  const leads = [
    { nome: "Exemplo — Paciente A", whatsapp: "(00) 00000-0001", servico: "Clareamento dental", status: "Novo", data_entrada: d(2) },
    { nome: "Exemplo — Paciente B", whatsapp: "(00) 00000-0002", servico: "Implante dentário", status: "Contato", data_entrada: d(15) },
    { nome: "Exemplo — Paciente C", whatsapp: "(00) 00000-0003", servico: "Aparelho ortodôntico", status: "Agendado", data_entrada: d(40) },
    { nome: "Exemplo — Paciente D", whatsapp: "(00) 00000-0004", servico: "Clareamento dental", status: "Convertido", data_entrada: d(70) },
    { nome: "Exemplo — Paciente E", whatsapp: "(00) 00000-0005", servico: "Lentes de contato dental", status: "Perdido", data_entrada: d(100) },
    { nome: "Exemplo — Paciente F", whatsapp: "(00) 00000-0006", servico: "Limpeza e prevenção", status: "Convertido", data_entrada: d(130) },
  ];
  const { data: ls, error } = await supabase.from("leads").insert(leads as any).select("id, servico");
  if (error) throw error;
  const r1 = await supabase.from("oportunidades").insert([
    { nome: "Implante unitário", lead_id: ls?.[1]?.id, servico: "Implante dentário", valor_estimado: 3500, status: "Em negociação", data: d(10) },
    { nome: "Tratamento ortodôntico", lead_id: ls?.[2]?.id, servico: "Aparelho ortodôntico", valor_estimado: 4200, status: "Agendada", data: d(35) },
    { nome: "Clareamento a laser", lead_id: ls?.[3]?.id, servico: "Clareamento dental", valor_estimado: 900, status: "Convertida", data: d(65) },
  ] as any);
  if (r1.error) throw r1.error;
  const r2 = await supabase.from("conteudos").insert([
    { titulo: "5 mitos sobre clareamento dental", tema: "Clareamento dental", tipo: "Reels", status: "Ideia", data_planejada: d(-10) },
    { titulo: "Como funciona o implante, passo a passo", tema: "Implantes", tipo: "Post", status: "Planejado", data_planejada: d(-5) },
  ] as any);
  if (r2.error) throw r2.error;
  const r3 = await supabase.from("tarefas").insert([
    { titulo: "Gravar vídeo sobre clareamento", responsavel: "Equipe de marketing", prioridade: "Alta", status: "Pendente", prazo: d(-3) },
  ] as any);
  if (r3.error) throw r3.error;
  await logActivity("Dados de exemplo carregados", "leads");
}
