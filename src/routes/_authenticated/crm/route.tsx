import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CrmShell } from "@/components/crm/CrmShell";

export const Route = createFileRoute("/_authenticated/crm")({
  component: () => <CrmShell><Outlet /></CrmShell>,
});
