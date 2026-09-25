import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Board", to: "/board" },
  { label: "Atividade", to: "/board" },
  { label: "Comentários", to: "/board" },
  { label: "Relatórios", to: "/board" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-[3vw]">
      <div className="app-panel flex h-[88vh] w-full max-w-[1680px] overflow-hidden">
        <Sidebar userEmail={user.email ?? undefined} />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between px-6 py-4">
            <div className="flex items-baseline gap-2">
              <span className="text-[13px] font-bold tracking-[-0.04em]">LITERARE</span>
              <span className="text-[11px] text-muted-foreground">Marketing</span>
            </div>
            <nav className="flex items-center gap-1">
              {NAV.map((item, i) => {
                const active = i === 0 && pathname.startsWith("/board");
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={cn(
                      "rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors duration-200",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <button
                aria-label="Notificações"
                className="icon-button ml-2 hover:icon-button-hover"
              >
                <Bell size={14} strokeWidth={1.6} />
              </button>
            </nav>
          </header>
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </div>
      </div>
    </div>
  );
}
