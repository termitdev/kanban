import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { AnimatePresence, motion } from "motion/react";
import { TaskCard } from "./TaskCard";
import type { ColumnConfig } from "@/lib/board-config";
import { cn } from "@/lib/utils";
import type { Member, Task } from "@/types/domain";

interface Props {
  column: ColumnConfig;
  tasks: Task[];
  members: Member[];
  index: number;
  onOpen: (task: Task) => void;
  onAction: (action: string, task: Task) => void;
}

export function Column({ column, tasks, members, index, onOpen, onAction }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: `column:${column.id}` });

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: index * 0.05, ease: "easeOut" }}
      className="flex w-[248px] shrink-0 flex-col"
    >
      <div className="flex items-baseline justify-between px-0.5">
        <h3 className="text-[12px] font-semibold uppercase tracking-[0.06em] text-foreground/70">
          {column.label}
        </h3>
        <span className="text-[11px] font-medium text-muted-foreground">
          {String(tasks.length).padStart(2, "0")}
        </span>
      </div>
      <div className={cn("mt-2 h-[2px] w-full rounded-full", column.rule)} />

      <div
        ref={setNodeRef}
        className={cn(
          "scroll-thin mt-3 flex min-h-[120px] flex-1 flex-col gap-2.5 overflow-y-auto rounded-[14px] pb-6 transition-colors duration-200",
          isOver && "bg-foreground/4 outline outline-1 outline-dashed outline-border",
        )}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <AnimatePresence initial={false}>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <TaskCard
                  task={task}
                  member={members.find((m) => m.id === task.assigneeId)}
                  onOpen={onOpen}
                  onAction={onAction}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </SortableContext>

        {tasks.length === 0 ? (
          <p className="rounded-[14px] border border-dashed border-border px-3 py-6 text-center text-[11px] text-muted-foreground">
            Nenhuma tarefa
          </p>
        ) : null}
      </div>
    </motion.section>
  );
}
