import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { NewEventModal } from "./NewEventModal";
import { Avatar } from "@/components/layout/Avatar";
import { TaskDrawer } from "@/components/tasks/TaskDrawer";
import { EVENT_CATEGORIES } from "@/lib/board-config";
import { useEvents } from "@/hooks/useEvents";
import { useMembers } from "@/hooks/useMembers";
import { useTasks } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/domain";

const WEEKDAYS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function MonthCalendar() {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [memberFilter, setMemberFilter] = useState("");
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [openTask, setOpenTask] = useState<Task | null>(null);

  const { data: events = [] } = useEvents();
  const { data: members = [] } = useMembers();
  const { data: tasks = [] } = useTasks();

  const days = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7; // monday-first
    const total = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = Array.from({ length: offset }, () => null);
    for (let d = 1; d <= total; d += 1) {
      cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const shift = (delta: number) =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));

  return (
    <div className="flex min-h-0 flex-1 flex-col px-6 pb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
            Marketing Operations
          </p>
          <h1 className="mt-1 text-[28px] font-semibold leading-none tracking-[-0.03em]">
            Calendário
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button aria-label="Mês anterior" onClick={() => shift(-1)} className="icon-button">
            <ChevronLeft size={14} strokeWidth={1.7} />
          </button>
          <span className="min-w-[150px] text-center text-[13px] font-semibold tracking-[-0.02em]">
            {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
          </span>
          <button aria-label="Próximo mês" onClick={() => shift(1)} className="icon-button">
            <ChevronRight size={14} strokeWidth={1.7} />
          </button>
          <button
            onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-secondary"
          >
            Hoje
          </button>
          <select
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
            className="field focus:field-focus w-auto rounded-full"
          >
            <option value="">Todos os usuários</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setModalDate(iso(today))}
            className="rounded-full bg-primary px-4 py-1.5 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Novo compromisso
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {WEEKDAYS.map((w) => (
          <span key={w} className="px-1">
            {w}
          </span>
        ))}
      </div>

      <div className="scroll-thin mt-2 grid min-h-0 flex-1 grid-cols-7 gap-1.5 overflow-y-auto">
        {days.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} className="rounded-[14px]" />;
          const key = iso(day);
          const isToday = key === iso(today);
          const dayEvents = events.filter(
            (e) => e.date === key && (!memberFilter || e.memberId === memberFilter),
          );
          const dayTasks = tasks.filter(
            (t) => t.dueDate === key && (!memberFilter || t.assigneeId === memberFilter),
          );
          const items = [...dayEvents, ...dayTasks];
          const showAll = expanded === key;
          const shown = showAll ? items : items.slice(0, 2);

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: Math.min(index, 20) * 0.006 }}
              onClick={() => setModalDate(key)}
              className="min-h-[104px] cursor-pointer rounded-[14px] border border-border/70 bg-card p-2 transition-colors hover:border-border"
            >
              <span
                className={cn(
                  "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold",
                  isToday ? "bg-primary text-primary-foreground" : "text-foreground/60",
                )}
              >
                {day.getDate()}
              </span>

              <div className="mt-1.5 space-y-1">
                {shown.map((item) => {
                  const isEvent = "category" in item;
                  const member = members.find(
                    (m) => m.id === (isEvent ? item.memberId : (item as Task).assigneeId),
                  );
                  return (
                    <button
                      key={item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isEvent) setOpenTask(item as Task);
                      }}
                      className="flex w-full items-center gap-1 rounded-[8px] bg-secondary px-1.5 py-1 text-left"
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 shrink-0 rounded-full",
                          isEvent
                            ? (EVENT_CATEGORIES.find((c) => c.id === item.category)?.dot ??
                                "bg-surface-grey")
                            : "bg-highlight",
                        )}
                      />
                      <span className="min-w-0 flex-1 truncate text-[10px] font-medium">
                        {isEvent && item.startTime ? `${item.startTime} ` : ""}
                        {item.title}
                      </span>
                      <Avatar member={member} size="xs" className="h-4 w-4 text-[8px]" />
                    </button>
                  );
                })}
                {items.length > 2 && !showAll ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpanded(key);
                    }}
                    className="px-1 text-[10px] font-medium text-muted-foreground hover:text-foreground"
                  >
                    + {items.length - 2} compromissos
                  </button>
                ) : null}
              </div>
            </motion.div>
          );
        })}
      </div>

      <NewEventModal
        open={modalDate !== null}
        date={modalDate ?? iso(today)}
        members={members}
        onClose={() => setModalDate(null)}
      />
      <TaskDrawer task={openTask} members={members} onClose={() => setOpenTask(null)} />
    </div>
  );
}
