import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  CalendarDays,
  Settings2,
  LayoutGrid,
  X,
  Check,
  ChevronDown,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { BUCKETS, CHANNELS, PRIORITIES, TAGS } from "@/lib/board-config";
import { cn } from "@/lib/utils";
import type { Member, TaskFilters, TaskPriority } from "@/types/domain";

interface Props {
  filters: TaskFilters;
  setFilters: (next: TaskFilters) => void;
  members: Member[];
  campaigns: string[];
}

function Dropdown({
  label,
  children,
  wide,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground/75 transition-colors hover:bg-secondary"
      >
        {label}
        <ChevronDown size={13} strokeWidth={1.6} />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -2 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.13, ease: "easeOut" }}
            className={cn(
              "absolute left-0 top-9 z-50 max-h-72 overflow-y-auto rounded-[12px] border border-border bg-popover p-1 shadow-lift",
              wide ? "w-60" : "w-48",
            )}
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onToggle,
  hint,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
  hint?: string;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-[9px] px-2.5 py-1.5 text-left text-[12px] transition-colors hover:bg-secondary"
    >
      <span className="flex items-center gap-2">
        <span
          className={cn(
            "flex h-3.5 w-3.5 items-center justify-center rounded-[4px] border",
            checked ? "border-primary bg-primary text-primary-foreground" : "border-border",
          )}
        >
          {checked ? <Check size={10} strokeWidth={3} /> : null}
        </span>
        {label}
      </span>
      {hint ? <span className="text-[10px] text-muted-foreground">{hint}</span> : null}
    </button>
  );
}

export function BoardToolbar({ filters, setFilters, members, campaigns }: Props) {
  const [searchOpen, setSearchOpen] = useState(false);

  const toggle = <K extends "assignees" | "priorities" | "channels" | "campaigns" | "tags">(
    key: K,
    value: string,
  ) => {
    const list = filters[key] as string[];
    const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
    setFilters({ ...filters, [key]: next } as TaskFilters);
  };

  const activePills: { key: string; label: string; clear: () => void }[] = [
    ...filters.assignees.map((id) => ({
      key: `a-${id}`,
      label: members.find((m) => m.id === id)?.name ?? "Responsável",
      clear: () => toggle("assignees", id),
    })),
    ...filters.priorities.map((p) => ({
      key: `p-${p}`,
      label: PRIORITIES.find((x) => x.id === p)?.label ?? p,
      clear: () => toggle("priorities", p),
    })),
    ...filters.channels.map((c) => ({
      key: `c-${c}`,
      label: c,
      clear: () => toggle("channels", c),
    })),
    ...filters.campaigns.map((c) => ({
      key: `k-${c}`,
      label: c,
      clear: () => toggle("campaigns", c),
    })),
    ...filters.tags.map((t) => ({ key: `t-${t}`, label: t, clear: () => toggle("tags", t) })),
  ];

  const iconButtons = [
    { icon: SlidersHorizontal, label: "Filtrar" },
    { icon: ArrowUpDown, label: "Ordenar" },
    { icon: CalendarDays, label: "Prazos" },
    { icon: Settings2, label: "Configurações" },
    { icon: LayoutGrid, label: "Visualização" },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="scroll-thin flex items-center gap-1 overflow-x-auto">
          {BUCKETS.map((bucket) => {
            const active = filters.bucket === bucket.id;
            return (
              <button
                key={bucket.id}
                onClick={() => setFilters({ ...filters, bucket: bucket.id })}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors duration-200",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {!active ? <span className="h-1.5 w-1.5 rounded-full bg-border" /> : null}
                {bucket.label}
              </button>
            );
          })}
        </div>

        <div className="mx-1 h-5 w-px bg-border" />

        <button
          aria-label="Buscar"
          onClick={() => setSearchOpen((v) => !v)}
          className={cn("icon-button hover:icon-button-hover", searchOpen && "icon-button-hover")}
        >
          <Search size={14} strokeWidth={1.6} />
        </button>
        {iconButtons.map(({ icon: Icon, label }) => (
          <button
            key={label}
            aria-label={label}
            title={label}
            className="icon-button hover:icon-button-hover"
          >
            <Icon size={14} strokeWidth={1.6} />
          </button>
        ))}

        <div className="mx-1 h-5 w-px bg-border" />

        <Dropdown label="Todos os usuários" wide>
          <CheckRow
            label="Todos"
            checked={filters.assignees.length === 0}
            onToggle={() => setFilters({ ...filters, assignees: [] })}
          />
          {members.map((m) => (
            <CheckRow
              key={m.id}
              label={m.name}
              checked={filters.assignees.includes(m.id)}
              onToggle={() => toggle("assignees", m.id)}
            />
          ))}
        </Dropdown>

        <Dropdown label="Prioridade">
          {PRIORITIES.map((p) => (
            <CheckRow
              key={p.id}
              label={p.label}
              checked={filters.priorities.includes(p.id as TaskPriority)}
              onToggle={() => toggle("priorities", p.id)}
            />
          ))}
        </Dropdown>

        <Dropdown label="Canal">
          {CHANNELS.map((c) => (
            <CheckRow
              key={c}
              label={c}
              checked={filters.channels.includes(c)}
              onToggle={() => toggle("channels", c)}
            />
          ))}
        </Dropdown>

        <Dropdown label="Campanha" wide>
          {campaigns.map((c) => (
            <CheckRow
              key={c}
              label={c}
              checked={filters.campaigns.includes(c)}
              onToggle={() => toggle("campaigns", c)}
            />
          ))}
        </Dropdown>

        <Dropdown label="Etiquetas">
          {TAGS.map((t) => (
            <CheckRow
              key={t}
              label={t}
              checked={filters.tags.includes(t)}
              onToggle={() => toggle("tags", t)}
            />
          ))}
        </Dropdown>
      </div>

      <AnimatePresence>
        {searchOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <input
              autoFocus
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Buscar tarefas, campanhas ou responsáveis..."
              className="field focus:field-focus max-w-md"
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {activePills.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          {activePills.map((pill) => (
            <span
              key={pill.key}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-foreground/75"
            >
              {pill.label}
              <button onClick={pill.clear} aria-label={`Remover ${pill.label}`}>
                <X size={11} strokeWidth={2} />
              </button>
            </span>
          ))}
          <button
            onClick={() =>
              setFilters({
                ...filters,
                assignees: [],
                priorities: [],
                channels: [],
                campaigns: [],
                tags: [],
              })
            }
            className="text-[11px] font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Limpar filtros
          </button>
        </div>
      ) : null}
    </div>
  );
}
