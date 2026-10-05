import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Clínica.AI — Marketing para clínicas odontológicas" },
      { name: "description", content: "Organize leads, planeje conteúdos e gere ideias de marketing com IA para sua clínica." },
      { property: "og:title", content: "Clínica.AI — Marketing para clínicas odontológicas" },
      { property: "og:description", content: "Organize leads, planeje conteúdos e gere ideias de marketing com IA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    throw redirect({ to: data.user ? "/dashboard" : "/auth" });
  },
  component: () => null,
});
