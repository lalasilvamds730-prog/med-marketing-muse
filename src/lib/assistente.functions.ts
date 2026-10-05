import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { gerarSugestoes, AiError } from "./assistente.server";

const Input = z.object({
  especialidade: z.string().trim().min(1).max(120),
  publico: z.string().trim().min(1).max(200),
  tema: z.string().trim().min(1).max(300),
  pedido: z.string().trim().max(1000).optional().default(""),
  quantidade: z.number().int().min(1).max(10).default(5),
});

const INSTRUCTIONS = `Você é um assistente de marketing para clínicas e profissionais da saúde no Brasil.
Gere sugestões de conteúdo práticas e acionáveis, em português do Brasil.
Regras:
- Foque em marketing e comunicação; nunca dê diagnósticos, prescrições, promessas de resultado ou dados médicos inventados.
- Siga as normas éticas de publicidade em saúde (sem antes/depois sensacionalista, sem garantias).
- Evite repetir títulos de conteúdos já existentes informados no contexto.
- Cada sugestão: título curto, objetivo claro, formato (Post, Reels, Stories, Vídeo, Artigo ou Campanha) e breve descrição com o que mostrar/dizer e uma chamada para ação.`;

export const gerarIdeias = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data, context }) => {
    const sb = context.supabase;
    const [{ data: perfil }, { data: conteudos }, { data: leads }] = await Promise.all([
      sb.from("profiles").select("clinica, area_de_atuacao").eq("id", context.userId).maybeSingle(),
      sb.from("conteudos").select("titulo, tipo, status").order("created_at", { ascending: false }).limit(30),
      sb.from("leads").select("servico").limit(500),
    ]);
    const servicos: Record<string, number> = {};
    for (const l of leads ?? []) if (l.servico) servicos[l.servico] = (servicos[l.servico] ?? 0) + 1;
    const topServicos = Object.entries(servicos).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([s, n]) => `${s} (${n})`);

    const input = `Contexto da clínica (dados do app):
- Clínica: ${perfil?.clinica || "não informado"}
- Área de atuação: ${perfil?.area_de_atuacao || "não informada"}
- Serviços mais procurados pelos leads: ${topServicos.join(", ") || "sem dados"}
- Conteúdos já cadastrados: ${(conteudos ?? []).map((c) => `${c.titulo} [${c.tipo}, ${c.status}]`).join("; ") || "nenhum"}

Solicitação:
- Especialidade: ${data.especialidade}
- Público-alvo: ${data.publico}
- Tema: ${data.tema}
${data.pedido ? `- Detalhes adicionais: ${data.pedido}\n` : ""}Gere exatamente ${data.quantidade} sugestões.`;

    try {
      return { ok: true as const, sugestoes: await gerarSugestoes(INSTRUCTIONS, input) };
    } catch (e) {
      const msg = e instanceof AiError ? e.message : "Não foi possível gerar sugestões agora.";
      console.error("assistente", e);
      return { ok: false as const, error: msg };
    }
  });
