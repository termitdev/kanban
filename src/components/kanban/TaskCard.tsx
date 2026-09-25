import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal, CheckSquare, Paperclip, MessageSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/layout/Avatar";
import { SURFACE_CLASS } from "@/lib/board-config";
import { cn } from "@/lib/utils";
import type { Member, Task } from "@/types/domain";

const surfaceFor = (task: Task): keyof typeof SURFACE_CLASS => {
  if (task.status === "concluido") return "green";
  if (task.status === "aprovacao") return "pink";
  if (task.status === "producao") return "lilac";
  if (task.priority === "alta") return "yellow";
  return "white";
};

const formatDate = (iso: string | null) => {
  if (!iso) return null;
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y?.slice(2)}`;
};

const isLate = (task: Task) =>
  task.status !== "concluido" &&
  !!task.dueDate &&
  task.dueDate < new Date().toISOString().slice(0, 10);

interface Props {
  task: Task;
  member?: Member;
  onOpen: (task: Task) => void;
  onAction: (action: string, task: Task) => void;
  dragging?: boolean;
}

export function TaskCard({ task, member, onOpen, onAction, dragging }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  const done = task.checklist.filter((c) => c.done).length;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        "group relative rounded-[16px] border border-border/70 p-3 transition-all duration-200 ease-out",
        SURFACE_CLASS[surfaceFor(task)],
        isDragging ? "opacity-30" : "hover:-translate-y-[2px] hover:shadow-lift",
        dragging && "shadow-drag scale-[1.02] border-border",
      )}
    >
      <div
        {...attributes}
        {...listeners}
        onClick={() => onOpen(task)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onOpen(task)}
        className="cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-[13px] font-semibold leading-snug tracking-[-0.01em]">
            {task.title}
          </h4>
          <span className="h-4 w-4 shrink-0" />
        </div>

        {task.campaign ? (
          <p className="mt-1 text-[10px] text-foreground/50">{task.campaign}</p>
        ) : null}

        <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-foreground/10">
          <div
            className="h-full rounded-full bg-foreground/70 transition-all duration-300"
            style={{ width: `${task.progress}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <Avatar member={member} size="xs" />
            <span className="truncate text-[11px] font-medium text-foreground/70">
              {member?.name ?? "Sem responsável"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-foreground/50">
            {done > 0 ? (
              <span className="inline-flex items-center gap-0.5">
                <CheckSquare size={11} strokeWidth={1.6} />
                {done}/{task.checklist.length}
              </span>
            ) : null}
            {task.description ? <MessageSquare size={11} strokeWidth={1.6} /> : null}
            {task.channel ? <Paperclip size={11} strokeWidth={1.6} /> : null}
            {task.dueDate ? <span>{formatDate(task.dueDate)}</span> : null}
          </div>
        </div>

        {isLate(task) || task.blocked || task.priority === "alta" ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {isLate(task) ? (
              <span className="rounded-full bg-foreground/8 px-2 py-0.5 text-[9px] font-medium text-foreground/60">
                Atrasada
              </span>
            ) : null}
            {task.blocked ? (
              <span className="rounded-full bg-foreground/8 px-2 py-0.5 text-[9px] font-medium text-foreground/60">
                Bloqueada
              </span>
            ) : null}
            {task.priority === "alta" ? (
              <span className="rounded-full border border-foreground/15 px-2 py-0.5 text-[9px] font-medium text-foreground/60">
                Alta
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div ref={menuRef} className="absolute right-2 top-2">
        <button
          aria-label="Ações da tarefa"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
          className="rounded-md p-0.5 text-foreground/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:text-foreground/70"
        >
          <MoreHorizontal size={15} strokeWidth={1.8} />
        </button>
        {menuOpen ? (
          <div className="absolute right-0 top-6 z-40 w-40 origin-top-right rounded-[11px] border border-border bg-popover p-1 shadow-lift">
            {[
              ["open", "Abrir tarefa"],
              ["edit", "Editar"],
              ["duplicate", "Duplicar"],
              ["priority", "Alterar prioridade"],
              ["block", task.blocked ? "Desbloquear" : "Bloquear"],
              ["archive", "Arquivar"],
              ["delete", "Excluir"],
            ].map(([action, label]) => (
              <button
                key={action}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onAction(action as string, task);
                }}
                className="w-full rounded-[8px] px-2.5 py-1.5 text-left text-[12px] text-foreground/80 transition-colors hover:bg-secondary"
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
