import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Entrar — Clínica.AI" }] }),
  component: () => <div className="grid min-h-screen place-items-center p-6 text-center"><p>Tela de acesso em construção.</p></div>,
});
