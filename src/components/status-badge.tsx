import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground",
  primary: "bg-primary-soft text-accent-foreground",
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-destructive",
};

const MAP: Record<string, keyof typeof TONES> = {
  Novo: "primary", Nova: "primary", Ideia: "neutral", Pendente: "neutral", Baixa: "neutral",
  Contato: "info", "Em negociação": "info", Planejado: "info", "Em andamento": "info", Média: "warning",
  Agendado: "warning", Agendada: "warning",
  Convertido: "success", Convertida: "success", Publicado: "success", Concluída: "success",
  Perdido: "danger", Perdida: "danger", Alta: "danger",
};

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium", TONES[MAP[value] ?? "neutral"], className)}>
      {value}
    </span>
  );
}
