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

export function useSave(table: TableName, describe: (row: Row, prev?: Row) => string | null) {
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
