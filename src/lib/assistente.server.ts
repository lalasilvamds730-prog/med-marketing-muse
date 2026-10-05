export type Sugestao = { titulo: string; objetivo: string; formato: string; descricao: string };

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["sugestoes"],
  properties: {
    sugestoes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["titulo", "objetivo", "formato", "descricao"],
        properties: {
          titulo: { type: "string" },
          objetivo: { type: "string" },
          formato: { type: "string", enum: ["Post", "Reels", "Stories", "Vídeo", "Artigo", "Campanha"] },
          descricao: { type: "string" },
        },
      },
    },
  },
};

export class AiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function gerarSugestoes(instructions: string, input: string): Promise<Sugestao[]> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new AiError(401, "Assistente não configurado.");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: "openai/gpt-6-astra",
      instructions,
      input,
      stream: true,
      store: false,
      reasoning: { effort: "low" },
      text: { format: { type: "json_schema", name: "sugestoes", strict: true, schema } },
    }),
  });
  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => "");
    let msg = "Não foi possível gerar sugestões agora.";
    try {
      msg = JSON.parse(body)?.error?.message ?? JSON.parse(body)?.message ?? msg;
    } catch {}
    if (res.status === 402) msg = "Os créditos de IA acabaram. Adicione créditos para continuar.";
    if (res.status === 429) msg = "Muitas solicitações. Aguarde um instante e tente novamente.";
    throw new AiError(res.status, msg);
  }
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let text = "";
  let refusal = false;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let i;
    while ((i = buf.indexOf("\n\n")) >= 0) {
      const frame = buf.slice(0, i);
      buf = buf.slice(i + 2);
      for (const line of frame.split("\n")) {
        if (!line.startsWith("data:")) continue;
        const d = line.slice(5).trim();
        if (!d || d === "[DONE]") continue;
        try {
          const ev = JSON.parse(d);
          if (ev.type === "response.output_text.delta") text += ev.delta ?? "";
          else if (ev.type === "response.refusal.delta") refusal = true;
          else if (ev.type === "error" || ev.type === "response.failed")
            throw new AiError(500, ev.error?.message ?? ev.response?.error?.message ?? "Falha ao gerar.");
        } catch (e) {
          if (e instanceof AiError) throw e;
        }
      }
    }
  }
  if (refusal || !text) throw new AiError(422, "O assistente não pôde atender esta solicitação.");
  return (JSON.parse(text).sugestoes ?? []) as Sugestao[];
}
