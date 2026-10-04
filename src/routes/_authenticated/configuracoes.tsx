import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Clínica.AI" }] }),
  component: ConfiguracoesPage,
});

const CAMPOS = [
  { key: "nome", label: "Nome do usuário", placeholder: "Seu nome", required: true },
  { key: "clinica", label: "Nome da clínica", placeholder: "Ex.: Clínica Sorriso" },
  { key: "email", label: "E-mail", placeholder: "voce@email.com", type: "email" },
  { key: "telefone", label: "Telefone", placeholder: "(00) 00000-0000" },
  { key: "area_de_atuacao", label: "Área de atuação", placeholder: "Ex.: Odontologia" },
] as const;

type FormState = Record<(typeof CAMPOS)[number]["key"], string>;

function ConfiguracoesPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState>({ nome: "", clinica: "", email: "", telefone: "", area_de_atuacao: "" });
  const [erro, setErro] = useState("");

  const perfil = useQuery({
    queryKey: ["perfil"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão expirada");
      const { data, error } = await (supabase.from("profiles") as any).select("*").eq("id", user.id).single();
      if (error) throw error;
      return data as Record<string, any>;
    },
  });

  useEffect(() => {
    if (perfil.data) {
      setForm({
        nome: perfil.data["nome"] ?? "",
        clinica: perfil.data["clinica"] ?? "",
        email: perfil.data["email"] ?? "",
        telefone: perfil.data["telefone"] ?? "",
        area_de_atuacao: perfil.data["area_de_atuacao"] ?? "",
      });
    }
  }, [perfil.data]);

  const salvar = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sessão expirada");
      const { error } = await (supabase.from("profiles") as any).update(form).eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["perfil"] });
      toast.success("Configurações salvas com sucesso.");
    },
    onError: (e: any) => toast.error("Não foi possível salvar: " + (e?.message ?? "erro desconhecido")),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome.trim()) {
      setErro("O nome do usuário é obrigatório.");
      return;
    }
    setErro("");
    salvar.mutate();
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Configurações" subtitle="Gerencie as informações do seu perfil e da sua clínica." />

      {perfil.isLoading ? (
        <div className="space-y-4 rounded-xl border bg-card p-6">
          {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 rounded-md" />)}
        </div>
      ) : perfil.error ? (
        <div className="rounded-xl border border-destructive/30 bg-danger-soft p-4 text-sm text-destructive">
          Não foi possível carregar suas configurações. Tente recarregar a página.
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5 rounded-xl border bg-card p-6">
          {CAMPOS.map((c) => (
            <div key={c.key} className="space-y-1.5">
              <Label htmlFor={c.key}>
                {c.label} {"required" in c && c.required && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id={c.key}
                type={"type" in c ? c.type : "text"}
                placeholder={c.placeholder}
                value={form[c.key]}
                onChange={(e) => setForm((f) => ({ ...f, [c.key]: e.target.value }))}
              />
            </div>
          ))}

          {erro && <p className="text-sm text-destructive">{erro}</p>}

          <Button type="submit" disabled={salvar.isPending} className="w-full sm:w-auto">
            <Save className="mr-2 h-4 w-4" />
            {salvar.isPending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </form>
      )}
    </div>
  );
}
