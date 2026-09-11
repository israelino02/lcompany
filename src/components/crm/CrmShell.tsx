import { createContext, useContext, useState, type ReactNode } from "react";
import { CrmNav } from "@/components/crm/CrmNav";
import { LeadDialog } from "@/components/crm/LeadDialog";
import { CrmProvider } from "@/hooks/use-crm";
import type { Lead } from "@/lib/crm";

type ShellValue = { openLead: (lead?: Lead) => void };
const ShellContext = createContext<ShellValue | null>(null);

export function CrmShell({ children }: { children: ReactNode }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Lead | null>(null);
  function openLead(lead?: Lead) { setSelected(lead ?? null); setDialogOpen(true); }
  return (
    <CrmProvider>
      <ShellContext.Provider value={{ openLead }}>
        <CrmNav onNew={() => openLead()} />
        {children}
        <LeadDialog open={dialogOpen} lead={selected} onOpenChange={setDialogOpen} />
      </ShellContext.Provider>
    </CrmProvider>
  );
}

export function useCrmShell() {
  const context = useContext(ShellContext);
  if (!context) throw new Error("useCrmShell precisa estar dentro de CrmShell");
  return context;
}
