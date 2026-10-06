import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Users, UserPlus, UserCheck, Handshake, TrendingUp, Wallet,
  ArrowRight, Activity, BarChart3, AlertCircle, Sparkles,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { PageHeader, EmptyState } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useList, formatDate, formatBRL, carregarExemplos,
  type Lead, type Oportunidade, type Atividade,
} from "@/lib/data";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Clínica.AI" }] }),
  component: DashboardPage,
});

const CHART_COLORS = [
  "var(--color-primary)",
  "var(--color-info)",
  "var(--color-warning)",
  "var(--color-success)",
  "var(--color-destructive)",
];

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function DashboardPage() {
  const qc = useQueryClient();
  const [carregando, setCarregando] = useState(false);
  const leads = useList<Lead>("leads");
  const oportunidades = useList<Oportunidade>("oportunidades");
  const atividades = useList<Atividade>("atividades");

  const isLoading = leads.isLoading || oportunidades.isLoading || atividades.isLoading;
  const hasError = leads.error || oportunidades.error || atividades.error;

  const stats = useMemo(() => {
    const ls = leads.data ?? [];
    const ops = oportunidades.data ?? [];
    const novos = ls.filter((l) => l.status === "Novo").length;
    const convertidos = ls.filter((l) => l.status === "Convertido").length;
    const abertas = ops.filter((o) => !["Convertida", "Perdida"].includes(o.status));
    const valorAberto = abertas.reduce((s, o) => s + (o.valor_estimado ?? 0), 0);
    const valorTotal = ops.reduce((s, o) => s + (o.valor_estimado ?? 0), 0);
    const conversao = ls.length ? Math.round((convertidos / ls.length) * 100) : 0;
    return { total: ls.length, novos, convertidos, abertas: abertas.length, valorAberto, valorTotal, conversao };
  }, [leads.data, oportunidades.data]);

  const leadsPorMes = useMemo(() => {
    const ls = leads.data ?? [];
    const now = new Date();
    const buckets: { mes: string; leads: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push({ mes: MESES[d.getMonth()]!, leads: 0 });
    }
    for (const l of ls) {
      const d = new Date(l.created_at);
      const diff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      if (diff >= 0 && diff < 6) buckets[5 - diff]!.leads++;
    }
    return buckets;
  }, [leads.data]);

  const opsPorStatus = useMemo(() => {
    const ops = oportunidades.data ?? [];
    const map = new Map<string, number>();
    for (const o of ops) map.set(o.status, (map.get(o.status) ?? 0) + 1);
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [oportunidades.data]);

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Olá! 👋" subtitle="Confira o resumo do marketing da sua clínica." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div>
        <PageHeader title="Olá! 👋" subtitle="Confira o resumo do marketing da sua clínica." />
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-danger-soft p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" /> Não foi possível carregar os indicadores. Tente recarregar a página.
        </div>
      </div>
    );
  }

  const semDados = stats.total === 0 && (oportunidades.data ?? []).length === 0;

  const cards = [
    { label: "Total de Leads", value: String(stats.total), icon: Users, href: "/leads" },
    { label: "Leads Novos", value: String(stats.novos), icon: UserPlus, href: "/leads" },
    { label: "Leads Convertidos", value: String(stats.convertidos), icon: UserCheck, href: "/leads" },
    { label: "Oportunidades Abertas", value: String(stats.abertas), icon: Handshake, href: "/oportunidades" },
    { label: "Valor em Negociação", value: formatBRL(stats.valorAberto), icon: Wallet, href: "/oportunidades" },
    { label: "Valor Total Estimado", value: formatBRL(stats.valorTotal), icon: TrendingUp, href: "/oportunidades" },
    { label: "Taxa de Conversão", value: `${stats.conversao}%`, icon: BarChart3, href: "/leads" },
  ];

  return (
    <div>
      <PageHeader title="Olá! 👋" subtitle="Confira o resumo do marketing da sua clínica." />

      {semDados ? (
        <EmptyState
          icon={<BarChart3 className="h-6 w-6" />}
          title="Ainda não há dados para mostrar"
          text="Cadastre seus primeiros leads e oportunidades para ver os indicadores e gráficos aqui."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link to="/leads" className="inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                Cadastrar lead <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/oportunidades" className="inline-flex items-center gap-1 rounded-md border bg-card px-4 py-2 text-sm font-medium">
                Cadastrar oportunidade
              </Link>
              <button
                type="button"
                disabled={carregando}
                onClick={async () => {
                  setCarregando(true);
                  try {
                    await carregarExemplos();
                    await qc.invalidateQueries();
                    toast.success("Dados de exemplo carregados.");
                  } catch (e: any) {
                    toast.error("Não foi possível carregar os exemplos: " + (e?.message ?? "erro"));
                  } finally {
                    setCarregando(false);
                  }
                }}
                className="inline-flex items-center gap-1 rounded-md border bg-card px-4 py-2 text-sm font-medium disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                {carregando ? "Carregando..." : "Carregar dados de exemplo"}
              </button>
            </div>
          }
        />
      ) : (
        <>
          {/* Indicadores */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((c) => (
              <Link
                key={c.label}
                to={c.href}
                className="group rounded-xl border bg-card p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{c.label}</span>
                  <c.icon className="h-4 w-4 text-primary" />
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight">{c.value}</p>
              </Link>
            ))}
          </div>

          {/* Gráficos */}
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border bg-card p-4">
              <h2 className="mb-4 font-semibold">Evolução de leads (últimos 6 meses)</h2>
              {stats.total === 0 ? (
                <p className="py-16 text-center text-sm text-muted-foreground">
                  Nenhum lead cadastrado ainda. Os gráficos aparecem quando houver dados.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={leadsPorMes} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                    <Tooltip
                      cursor={{ fill: "var(--color-muted)" }}
                      contentStyle={{
                        background: "var(--color-popover)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                        fontSize: 13,
                      }}
                    />
                    <Bar dataKey="leads" name="Leads" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="rounded-xl border bg-card p-4">
              <h2 className="mb-4 font-semibold">Oportunidades por status</h2>
              {opsPorStatus.length === 0 ? (
                <p className="py-16 text-center text-sm text-muted-foreground">
                  Nenhuma oportunidade cadastrada ainda. Os gráficos aparecem quando houver dados.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={opsPorStatus} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                      {opsPorStatus.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-popover)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "var(--radius-md)",
                        fontSize: 13,
                      }}
                    />
                    <Legend fontSize={12} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}

      {/* Atividades recentes */}
      <div className="mt-6 rounded-xl border bg-card p-4">
        <h2 className="mb-3 flex items-center gap-2 font-semibold">
          <Activity className="h-4 w-4 text-primary" /> Atividades recentes
        </h2>
        {(atividades.data ?? []).length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhuma atividade registrada ainda. As ações que você fizer no sistema aparecem aqui.
          </p>
        ) : (
          <ul className="divide-y">
            {(atividades.data ?? []).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="min-w-0 truncate">{a.descricao}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{formatDate(a.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
