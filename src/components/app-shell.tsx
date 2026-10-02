import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Users, CalendarDays, CheckSquare, Briefcase, Sparkles, Settings, LogOut, Menu, Stethoscope } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/conteudos", label: "Conteúdos", icon: CalendarDays },
  { to: "/tarefas", label: "Tarefas", icon: CheckSquare },
  { to: "/oportunidades", label: "Oportunidades", icon: Briefcase },
  { to: "/assistente", label: "Assistente IA", icon: Sparkles },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
] as const;

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground"><Stethoscope className="h-5 w-5" /></div>
      <span className="text-lg font-bold tracking-tight">Clínica<span className="text-primary">.AI</span></span>
    </div>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };
  return (
    <div className="flex h-full flex-col">
      <nav className="flex-1 space-y-1" aria-label="Menu principal">
        {NAV.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-muted"
            activeProps={{ className: "!bg-sidebar-accent !text-sidebar-accent-foreground font-semibold", "aria-current": "page" }}
          >
            <n.icon className="h-[18px] w-[18px] shrink-0" />
            {n.label}
          </Link>
        ))}
      </nav>
      <Button variant="ghost" onClick={signOut} className="justify-start gap-3 px-3 text-muted-foreground">
        <LogOut className="h-[18px] w-[18px]" /> Sair
      </Button>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-sidebar p-4 lg:flex">
        <div className="mb-8 px-2 pt-2"><Brand /></div>
        <NavList />
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card/90 px-4 backdrop-blur lg:hidden">
        <Brand />
        <Button variant="ghost" size="icon" aria-label="Abrir menu" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></Button>
      </header>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-4">
          <SheetTitle className="mb-6 px-2"><Brand /></SheetTitle>
          <NavList onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className="px-4 py-6 sm:px-6 lg:ml-64 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
