import { useMemo, useState, type ReactNode } from "react";
import { Pencil, Plus, Search, Trash2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, EmptyState } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { useList, useRemove, useSave, type Row, type TableName } from "@/lib/data";
import { cn } from "@/lib/utils";

export type Field = {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select" | "date" | "number";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  hideOnCreate?: boolean;
  full?: boolean;
};

export type Column = {
  label: string;
  render: (row: Row) => ReactNode;
  primary?: boolean;
  hideMobile?: boolean;
};

type Props = {
  table: TableName;
  title: string;
  subtitle: string;
  singular: string;
  newLabel: string;
  icon: ReactNode;
  fields: Field[];
  columns: Column[];
  defaults: () => Record<string, any>;
  searchKeys: string[];
  filters: { name: string; label: string; options: string[] }[];
  statusField: string;
  statusOptions: string[];
  describe: (row: Row, prev?: Row) => string | null;
  highlight?: (row: Row) => boolean;
  validate?: (v: Record<string, any>) => string | null;
};

export function CrudPage(p: Props) {
  const { data, isLoading, error } = useList(p.table);
  const save = useSave(p.table, p.describe);
  const remove = useRemove(p.table);
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<Row | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Row | null>(null);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data ?? []).filter((r) => {
      if (term && !p.searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(term))) return false;
      return Object.entries(filters).every(([k, v]) => !v || v === "all" || r[k] === v);
    });
  }, [data, q, filters, p.searchKeys]);

  const changeStatus = (row: Row, value: string) =>
    save.mutate(
      { values: { [p.statusField]: value }, prev: row },
      { onSuccess: () => toast.success(`Status alterado para "${value}".`) },
    );

  const statusSelect = (row: Row) => (
    <Select value={row[p.statusField]} onValueChange={(v) => changeStatus(row, v)}>
      <SelectTrigger aria-label="Alterar status" className="h-8 w-auto gap-1 border-none bg-transparent px-0 shadow-none focus:ring-0">
        <StatusBadge value={row[p.statusField]} />
      </SelectTrigger>
      <SelectContent>
        {p.statusOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
      </SelectContent>
    </Select>
  );

  const actions = (row: Row) => (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" aria-label={`Editar ${p.singular}`} onClick={() => setEditing(row)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" aria-label={`Excluir ${p.singular}`} onClick={() => setDeleting(row)} className="text-destructive hover:text-destructive">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div>
      <PageHeader
        title={p.title}
        subtitle={p.subtitle}
        action={<Button onClick={() => setEditing(null)} className="w-full sm:w-auto"><Plus className="h-4 w-4" />{p.newLabel}</Button>}
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label="Pesquisar" placeholder="Pesquisar..." value={q} onChange={(e) => setQ(e.target.value)} className="bg-card pl-9" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          {p.filters.map((f) => (
            <Select key={f.name} value={filters[f.name] ?? "all"} onValueChange={(v) => setFilters((s) => ({ ...s, [f.name]: v }))}>
              <SelectTrigger aria-label={`Filtrar por ${f.label}`} className="bg-card sm:w-44"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{f.label}: todos</SelectItem>
                {f.options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-danger-soft p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" /> Não foi possível carregar os dados. Tente recarregar a página.
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={p.icon}
          title={data?.length ? "Nenhum resultado encontrado" : `Nenhum registro ainda`}
          text={data?.length ? "Tente mudar a pesquisa ou os filtros." : `Clique em "${p.newLabel}" para cadastrar o primeiro.`}
        />
      ) : (
        <>
          {/* Desktop: tabela */}
          <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  {p.columns.map((c) => <th key={c.label} className="px-4 py-3 font-medium">{c.label}</th>)}
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className={cn("border-t transition-colors hover:bg-muted/40", p.highlight?.(r) && "bg-danger-soft/50 shadow-[inset_3px_0_0_var(--destructive)]")}>
                    {p.columns.map((c) => (
                      <td key={c.label} className={cn("px-4 py-3 align-middle", c.primary && "font-medium")}>{c.render(r)}</td>
                    ))}
                    <td className="px-4 py-3">{statusSelect(r)}</td>
                    <td className="px-4 py-3">{actions(r)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: cards */}
          <div className="space-y-3 md:hidden">
            {rows.map((r) => (
              <div key={r.id} className={cn("rounded-xl border bg-card p-4", p.highlight?.(r) && "border-l-4 border-l-destructive")}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    {p.columns.filter((c) => c.primary).map((c) => <div key={c.label} className="truncate font-semibold">{c.render(r)}</div>)}
                  </div>
                  {statusSelect(r)}
                </div>
                <dl className="mt-2 space-y-1 text-sm">
                  {p.columns.filter((c) => !c.primary && !c.hideMobile).map((c) => (
                    <div key={c.label} className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">{c.label}</dt>
                      <dd className="min-w-0 truncate text-right">{c.render(r)}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-2 border-t pt-2">{actions(r)}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {editing !== undefined && (
        <FormDialog
          key={editing?.id ?? "new"}
          title={editing ? `Editar ${p.singular}` : p.newLabel.replace("+ ", "")}
          fields={p.fields.filter((f) => editing || !f.hideOnCreate)}
          initial={editing ?? p.defaults()}
          saving={save.isPending}
          validate={p.validate}
          onClose={() => setEditing(undefined)}
          onSubmit={(values) =>
            save.mutate(
              { values, prev: editing ?? undefined },
              {
                onSuccess: () => {
                  toast.success(editing ? "Alterações salvas com sucesso." : `${p.singular[0].toUpperCase() + p.singular.slice(1)} cadastrado com sucesso.`);
                  setEditing(undefined);
                },
              },
            )
          }
        />
      )}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {p.singular}?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita. O registro será removido permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleting && remove.mutate(deleting.id)}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function FormDialog({
  title, fields, initial, saving, onClose, onSubmit, validate,
}: {
  title: string; fields: Field[]; initial: Record<string, any>; saving: boolean;
  onClose: () => void; onSubmit: (v: Record<string, any>) => void; validate?: (v: Record<string, any>) => string | null;
}) {
  const [values, setValues] = useState<Record<string, any>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, initial[f.name] ?? ""])),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: string, v: any) => setValues((s) => ({ ...s, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    for (const f of fields) {
      const v = String(values[f.name] ?? "").trim();
      if (f.required && !v) errs[f.name] = `Preencha o campo "${f.label}".`;
      else if (f.type === "email" && v && !/^\S+@\S+\.\S+$/.test(v)) errs[f.name] = "Informe um e-mail válido.";
      else if (v.length > 2000) errs[f.name] = "Texto muito longo.";
    }
    setErrors(errs);
    if (Object.keys(errs).length) { toast.error("Verifique os campos destacados."); return; }
    const out: Record<string, any> = {};
    for (const f of fields) {
      const v = values[f.name];
      if (f.type === "number") out[f.name] = Number(v) || 0;
      else if (f.type === "date" || f.type === "select") out[f.name] = v === "" || v === "none" ? null : v;
      else out[f.name] = String(v ?? "").trim();
    }
    const custom = validate?.(out);
    if (custom) { toast.error(custom); return; }
    onSubmit(out);
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Campos com * são obrigatórios.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
          {fields.map((f) => {
            const id = `f-${f.name}`;
            const err = errors[f.name];
            const common = { id, "aria-invalid": !!err, className: cn(err && "border-destructive") };
            return (
              <div key={f.name} className={cn("space-y-1.5", (f.full || f.type === "textarea") && "sm:col-span-2")}>
                <Label htmlFor={id}>{f.label}{f.required && " *"}</Label>
                {f.type === "textarea" ? (
                  <Textarea {...common} rows={3} placeholder={f.placeholder} value={values[f.name]} onChange={(e) => set(f.name, e.target.value)} />
                ) : f.type === "select" ? (
                  <Select value={values[f.name] || "none"} onValueChange={(v) => set(f.name, v)}>
                    <SelectTrigger {...common}><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {!f.required && <SelectItem value="none">Nenhum</SelectItem>}
                      {f.options?.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input {...common} type={f.type} step={f.type === "number" ? "0.01" : undefined} min={f.type === "number" ? 0 : undefined} placeholder={f.placeholder} value={values[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} />
                )}
                {err && <p className="text-xs text-destructive">{err}</p>}
              </div>
            );
          })}
          <DialogFooter className="gap-2 sm:col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
