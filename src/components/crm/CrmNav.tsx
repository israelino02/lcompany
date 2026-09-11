import { Link } from "@tanstack/react-router";
import { BarChart3, Columns3, ListTodo, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CrmNav({ onNew }: { onNew: () => void }) {
  const item = "flex h-9 items-center gap-2 rounded-md px-3 text-xs font-semibold text-muted-foreground hover:bg-surface-2 hover:text-foreground";
  const active = "bg-crm-soft text-crm-light";
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
      <nav aria-label="Seções do CRM" className="flex items-center gap-1 overflow-x-auto">
        <Link to="/crm" className={item} activeOptions={{ exact: true }} activeProps={{ className: active }}><BarChart3 size={15} /> Relatório</Link>
        <Link to="/crm/funil" className={item} activeProps={{ className: active }}><Columns3 size={15} /> Funil</Link>
        <Link to="/crm/leads" className={item} activeProps={{ className: active }}><ListTodo size={15} /> Leads ativos</Link>
      </nav>
      <Button type="button" onClick={onNew} className="bg-crm text-background hover:bg-crm-light"><Plus size={15} /> Novo lead</Button>
    </div>
  );
}
