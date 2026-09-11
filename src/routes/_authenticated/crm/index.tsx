import { createFileRoute } from "@tanstack/react-router";
import { Archive, CircleCheckBig, CircleX, Target, Users } from "lucide-react";
import { useCrm } from "@/hooks/use-crm";
import { CRM_ORIGINS, ORIGIN_LABEL, type LeadOrigin } from "@/lib/crm";

export const Route = createFileRoute("/_authenticated/crm/")({
  head: () => ({ meta: [
    { title: "Relatório Geral — CRM Lino Company" },
    { name: "description", content: "Indicadores gerais, conversão e desempenho comercial do CRM Lino Company." },
    { property: "og:title", content: "Relatório Geral — CRM Lino Company" },
    { property: "og:description", content: "Indicadores gerais e conversão comercial por origem." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { leads, loading } = useCrm();
  const visible = leads.filter((lead) => !lead.arquivado);
  const closed = visible.filter((lead) => lead.status === "cliente_fechado").length;
  const lost = visible.filter((lead) => lead.status === "perdido_sem_interesse" || lead.status === "cliente_perdido").length;
  const active = visible.length - closed - lost;
  const conversion = closed + lost > 0 ? (closed / (closed + lost)) * 100 : 0;
  const metrics = [
    { label: "Total de leads", value: visible.length, icon: Users },
    { label: "Ativos", value: active, icon: Target },
    { label: "Fechados", value: closed, icon: CircleCheckBig },
    { label: "Perdidos", value: lost, icon: CircleX },
    { label: "Conversão", value: `${Math.round(conversion)}%`, icon: Archive },
  ];

  return (
    <main className="mx-auto w-full max-w-[1500px] px-4 py-7 sm:px-6">
      <div><p className="label-caps text-crm-light">CRM Lino Company</p><h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Relatório Geral</h1><p className="mt-1 text-sm text-muted-foreground">Visão rápida da operação comercial.</p></div>
      {loading ? <div className="mt-7 text-sm text-muted-foreground">Carregando indicadores…</div> : <>
        <section className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{metrics.map(({ label, value, icon: Icon }) => <article key={label} className="surface-card p-4"><div className="flex items-center justify-between"><p className="text-xs font-medium text-muted-foreground">{label}</p><Icon size={16} className="text-crm-light" /></div><strong className="num mt-4 block text-3xl font-semibold">{value}</strong></article>)}</section>
        <section className="mt-5 border-t border-border pt-6"><div className="flex items-end justify-between gap-3"><div><h2 className="text-lg font-semibold">Conversão por origem</h2><p className="text-xs text-muted-foreground">Fechados sobre resultados definitivos.</p></div></div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{CRM_ORIGINS.map((origin) => <OriginMetric key={origin} origin={origin} leads={visible} />)}</div>
        </section>
        {visible.length === 0 && <div className="mt-8 border-t border-dashed border-border py-10 text-center"><p className="text-sm font-medium">Seu CRM está pronto para o primeiro lead.</p><p className="mt-1 text-xs text-muted-foreground">Use “Novo lead” para começar a acompanhar sua operação.</p></div>}
      </>}
    </main>
  );
}

function OriginMetric({ origin, leads }: { origin: LeadOrigin; leads: ReturnType<typeof useCrm>["leads"] }) {
  const list = leads.filter((lead) => lead.origem === origin);
  const closed = list.filter((lead) => lead.status === "cliente_fechado").length;
  const decided = list.filter((lead) => ["cliente_fechado", "perdido_sem_interesse", "cliente_perdido"].includes(lead.status)).length;
  const rate = decided ? Math.round((closed / decided) * 100) : 0;
  return <article className="surface-card p-4"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold">{ORIGIN_LABEL[origin]}</h3><span className="num text-sm text-crm-light">{rate}%</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full bg-crm" style={{ width: `${rate}%` }} /></div><p className="mt-2 text-[11px] text-muted-foreground">{closed} fechado{closed === 1 ? "" : "s"} · {list.length} lead{list.length === 1 ? "" : "s"}</p></article>;
}
