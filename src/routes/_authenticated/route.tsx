import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { CalendarDays, ContactRound, LogOut, UsersRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/" });
    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = useNavigate();

  async function sair() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  const linkClass =
    "flex h-9 items-center gap-2 rounded-md px-3 text-xs font-semibold text-muted-foreground hover:bg-surface-2 hover:text-foreground";

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex min-h-14 w-full max-w-[1500px] items-center gap-3 px-4 sm:px-6">
          <Link to="/agenda" className="mr-auto font-display text-xl font-semibold text-foreground">
            Altivus<span className="text-crm">.</span>
          </Link>
          <nav aria-label="Navegação principal" className="flex items-center gap-1 overflow-x-auto">
            <Link to="/agenda" className={linkClass} activeProps={{ className: "bg-surface-3 text-foreground" }}>
              <CalendarDays size={15} /> <span className="hidden sm:inline">Agenda</span>
            </Link>
            <Link to="/crm" className={linkClass} activeOptions={{ includeSearch: false, exact: false }} activeProps={{ className: "bg-crm-soft text-crm-light" }}>
              <ContactRound size={15} /> CRM
            </Link>
            <Link to="/clientes" className={linkClass} activeProps={{ className: "bg-surface-3 text-foreground" }}>
              <UsersRound size={15} /> <span className="hidden sm:inline">Clientes</span>
            </Link>
            <Button type="button" variant="ghost" size="icon" onClick={sair} aria-label="Sair da conta" title="Sair da conta">
              <LogOut size={15} />
            </Button>
          </nav>
        </div>
      </header>
      <Outlet />
    </>
  );
}
