import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Sparkles, Loader2, Plus, Check, Target, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { gerarIdeias } from "@/lib/assistente.functions";
import { logActivity, CONTEUDO_TIPOS } from "@/lib/data";

type Sugestao = { titulo: string; objetivo: string; formato: string; descricao: string };

export const Route = createFileRoute("/_authenticated/assistente")({
  head: () => ({ meta: [{ title: "Assistente IA — Clínica.AI" }] }),
  component: AssistentePage,
});

function AssistentePage() {
  const gerar = useServerFn(gerarIdeias);
  const qc = useQueryClient();
  const [form, setForm] = useState({ especialidade: "", publico: "", tema: "", pedido: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [salvos, setSalvos] = useState<Set<number>>(new Set());

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.especialidade.trim()) errs["especialidade"] = "Informe a especialidade.";
    if (!form.publico.trim()) errs["publico"] = "Informe o público-alvo.";
    if (!form.tema.trim()) errs["tema"] = "Informe o tema.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    setErro(null);
    try {
      const r = await gerar({ data: { ...form, quantidade: 5 } });
      if (r.ok) {
        setSugestoes(r.sugestoes);
        setSalvos(new Set());
      } else setErro(r.error);
    } catch {
      setErro("Não foi possível gerar sugestões agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function salvar(s: Sugestao, i: number) {
    const tipo = CONTEUDO_TIPOS.includes(s.formato) ? s.formato : "Post";
    const { error } = await supabase.from("conteudos").insert({
      titulo: s.titulo,
      tema: form.tema,
      tipo,
      status: "Ideia",
      observacoes: `Objetivo: ${s.objetivo}\n\n${s.descricao}`,
    } as any);
    if (error) return toast.error("Não foi possível salvar o conteúdo.");
    await logActivity(`Novo conteúdo pelo Assistente IA: ${s.titulo}`, "conteudos");
    qc.invalidateQueries({ queryKey: ["conteudos"] });
    qc.invalidateQueries({ queryKey: ["atividades"] });
    setSalvos((p) => new Set(p).add(i));
    toast.success("Ideia salva em Conteúdos.");
  }

  const field = (k: "especialidade" | "publico" | "tema", label: string, ph: string) => (
    <div className="space-y-1.5">
      <Label htmlFor={k}>{label} *</Label>
      <Input id={k} value={form[k]} onChange={set(k)} placeholder={ph} aria-invalid={!!errors[k]} />
      {errors[k] && <p className="text-xs text-destructive">{errors[k]}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assistente IA"
        subtitle="Gere ideias de conteúdo para sua clínica com base na especialidade, no público e no tema."
      />

      <Card className="p-5">
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="grid gap-4 md:grid-cols-3">
            {field("especialidade", "Especialidade", "Ex.: Odontologia")}
            {field("publico", "Público-alvo", "Ex.: Adultos de 25 a 45 anos")}
            {field("tema", "Tema", "Ex.: Clareamento dental")}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pedido">Detalhes adicionais (opcional)</Label>
            <Textarea
              id="pedido"
              rows={3}
              value={form.pedido}
              onChange={set("pedido")}
              placeholder="Ex.: Crie 5 ideias de conteúdo para uma clínica odontológica, com tom leve e educativo."
            />
          </div>
          <p className="text-xs text-muted-foreground">
            O assistente também considera a área de atuação, os serviços procurados pelos leads e os conteúdos já cadastrados.
            Ele não fornece orientações médicas.
          </p>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            {loading ? "Gerando..." : "Gerar ideias"}
          </Button>
        </form>
      </Card>

      {erro && (
        <Card role="alert" className="border-destructive/40 p-4 text-sm text-destructive">
          {erro}
        </Card>
      )}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-40 animate-pulse bg-muted/50" />
          ))}
        </div>
      ) : sugestoes.length === 0 ? (
        !erro && (
          <EmptyState
            icon={Sparkles}
            title="Nenhuma sugestão ainda"
            description="Preencha os campos acima e clique em “Gerar ideias”."
          />
        )
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sugestoes.map((s, i) => (
            <Card key={i} className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold leading-snug">{s.titulo}</h3>
                <Badge variant="secondary" className="shrink-0">
                  <LayoutGrid className="mr-1 h-3 w-3" />
                  {s.formato}
                </Badge>
              </div>
              <p className="flex gap-2 text-sm">
                <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span><span className="font-medium">Objetivo:</span> {s.objetivo}</span>
              </p>
              <p className="flex-1 text-sm text-muted-foreground">{s.descricao}</p>
              <Button
                variant="outline"
                size="sm"
                className="self-start"
                disabled={salvos.has(i)}
                onClick={() => salvar(s, i)}
              >
                {salvos.has(i) ? <Check className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                {salvos.has(i) ? "Salvo em Conteúdos" : "Salvar em Conteúdos"}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
