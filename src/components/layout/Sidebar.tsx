import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarDays,
  KanbanSquare,
  LayoutGrid,
  Megaphone,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { signOut } from "@/hooks/useAuth";

const ITEMS = [
  { to: "/board", icon: LayoutGrid, label: "Dashboard", exact: false, enabled: true },
  { to: "/board", icon: KanbanSquare, label: "Kanban", exact: true, enabled: true },
  { to: "/calendar", icon: CalendarDays, label: "Calendário", exact: true, enabled: true },
  { to: "/board", icon: Megaphone, label: "Campanhas", exact: false, enabled: false },
  { to: "/board", icon: FileText, label: "Conteúdo", exact: false, enabled: false },
  { to: "/board", icon: Users, label: "CRM", exact: false, enabled: false },
  { to: "/board", icon: BarChart3, label: "Relatórios", exact: false, enabled: false },
  { to: "/board", icon: Settings, label: "Configurações", exact: false, enabled: false },
] as const;

export function Sidebar({ userEmail }: { userEmail?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <aside className="flex w-[56px] shrink-0 flex-col items-center justify-between border-r border-border/60 py-4">
      <div className="flex flex-col items-center gap-1">
        <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-[10px] bg-primary text-[11px] font-bold text-primary-foreground">
          L
        </div>
        {ITEMS.slice(1).map((item, i) => {
          const active = pathname === item.to && item.enabled;
          const Icon = item.icon;
          return (
            <Link
              key={`${item.label}-${i}`}
              to={item.to}
              aria-label={item.label}
              title={item.label}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-[11px] transition-colors duration-200",
                active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground",
                !item.enabled && "opacity-40",
              )}
            >
              <Icon size={16} strokeWidth={1.6} />
            </Link>
          );
        })}
      </div>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Perfil"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-lilac text-[11px] font-semibold text-foreground/80"
        >
          {(userEmail ?? "U")[0]?.toUpperCase()}
        </button>
        {menuOpen ? (
          <div className="absolute bottom-0 left-10 z-50 w-44 rounded-[12px] border border-border bg-popover p-1 shadow-lift">
            <p className="truncate px-3 py-2 text-[11px] text-muted-foreground">{userEmail}</p>
            <button className="w-full rounded-[9px] px-3 py-1.5 text-left text-[12px] hover:bg-secondary">
              Perfil
            </button>
            <button className="w-full rounded-[9px] px-3 py-1.5 text-left text-[12px] hover:bg-secondary">
              Preferências
            </button>
            <button
              onClick={() => signOut()}
              className="flex w-full items-center gap-2 rounded-[9px] px-3 py-1.5 text-left text-[12px] hover:bg-secondary"
            >
              <LogOut size={13} strokeWidth={1.6} /> Sair
            </button>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
