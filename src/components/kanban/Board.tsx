import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Column } from "./Column";
import { TaskCard } from "./TaskCard";
import { BoardToolbar } from "./BoardToolbar";
import { TeamOverview } from "@/components/users/TeamOverview";
import { TaskDrawer } from "@/components/tasks/TaskDrawer";
import { NewTaskModal } from "@/components/tasks/NewTaskModal";
import { COLUMNS } from "@/lib/board-config";
import { useMembers } from "@/hooks/useMembers";
import { useCreateTask, useDeleteTask, useTasks, useUpdateTask } from "@/hooks/useTasks";
import { emptyFilters, type Task, type TaskFilters, type TaskStatus } from "@/types/domain";

const BUCKET_STATUS: Record<TaskFilters["bucket"], TaskStatus[] | null> = {
  andamento: ["planejamento", "producao", "aprovacao"],
  backlog: ["backlog"],
  concluido: ["concluido"],
  todos: null,
};

export function Board() {
  const { data: tasks = [], isLoading, isError } = useTasks();
  const { data: members = [] } = useMembers();
  const update = useUpdateTask();
  const remove = useDeleteTask();
  const create = useCreateTask();

  const [filters, setFilters] = useState<TaskFilters>(emptyFilters);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openTask, setOpenTask] = useState<Task | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const campaigns = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.campaign).filter(Boolean))) as string[],
    [tasks],
  );

  const visible = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    const allowed = BUCKET_STATUS[filters.bucket];
    return tasks.filter((t) => {
      if (allowed && !allowed.includes(t.status)) return false;
      if (filters.assignees.length && !filters.assignees.includes(t.assigneeId ?? "")) return false;
      if (filters.priorities.length && !filters.priorities.includes(t.priority)) return false;
      if (filters.channels.length && !filters.channels.includes(t.channel ?? "")) return false;
      if (filters.campaigns.length && !filters.campaigns.includes(t.campaign ?? "")) return false;
      if (filters.tags.length && !filters.tags.some((tag) => t.tags.includes(tag))) return false;
      if (term) {
        const assignee = members.find((m) => m.id === t.assigneeId)?.name.toLowerCase() ?? "";
        const haystack = `${t.title} ${t.campaign ?? ""} ${assignee}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [tasks, filters, members]);

  const metrics = [
    { label: "Tarefas abertas", value: tasks.filter((t) => t.status !== "concluido").length },
    { label: "Em aprovação", value: tasks.filter((t) => t.status === "aprovacao").length },
    { label: "Campanhas ativas", value: campaigns.length },
  ];

  const activeTask = tasks.find((t) => t.id === activeId) ?? null;

  const onDragStart = (event: DragStartEvent) => setActiveId(String(event.active.id));

  const onDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const task = tasks.find((t) => t.id === active.id);
    if (!task) return;

    const overId = String(over.id);
    const targetStatus = overId.startsWith("column:")
      ? (overId.slice(7) as TaskStatus)
      : tasks.find((t) => t.id === overId)?.status;

    if (!targetStatus || targetStatus === task.status) return;
    update.mutate({ id: task.id, patch: { status: targetStatus } });
  };

  const handleAction = (action: string, task: Task) => {
    if (action === "open" || action === "edit") setOpenTask(task);
    if (action === "delete" || action === "archive") remove.mutate(task.id);
    if (action === "block") update.mutate({ id: task.id, patch: { blocked: !task.blocked } });
    if (action === "priority")
      update.mutate({
        id: task.id,
        patch: { priority: task.priority === "alta" ? "normal" : "alta" },
      });
    if (action === "duplicate")
      create.mutate({
        title: `${task.title} (cópia)`,
        status: task.status,
        priority: task.priority,
        assigneeId: task.assigneeId,
        campaign: task.campaign,
        channel: task.channel,
        tags: task.tags,
        dueDate: task.dueDate,
      });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
          Marketing Operations
        </p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-6">
          <h1 className="text-[28px] font-semibold leading-none tracking-[-0.03em]">
            Operação de Marketing
          </h1>
          <div className="flex items-end gap-8">
            {metrics.map((m) => (
              <div key={m.label}>
                <p className="text-[10px] uppercase tracking-[0.07em] text-muted-foreground">
                  {m.label}
                </p>
                <p className="mt-0.5 text-[24px] font-semibold leading-none tracking-[-0.03em]">
                  {m.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <BoardToolbar
            filters={filters}
            setFilters={setFilters}
            members={members}
            campaigns={campaigns}
          />
        </div>

        <div className="mt-4 border-t border-border/70 pt-3">
          <TeamOverview
            members={members}
            tasks={tasks}
            selected={filters.assignees}
            onSelect={(id) =>
              setFilters({
                ...filters,
                assignees: filters.assignees.includes(id)
                  ? filters.assignees.filter((a) => a !== id)
                  : [...filters.assignees, id],
              })
            }
          />
        </div>
      </div>

      <div className="scroll-thin mt-4 min-h-0 flex-1 overflow-x-auto px-6 pb-4">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-[12px] text-muted-foreground">
            Carregando o board...
          </div>
        ) : isError ? (
          <div className="flex h-40 items-center justify-center text-[12px] text-destructive">
            Não foi possível carregar as tarefas.
          </div>
        ) : visible.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-[12px] text-muted-foreground">
            Nenhuma tarefa corresponde aos filtros aplicados.
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          >
            <div className="flex h-full gap-3.5">
              {COLUMNS.map((column, index) => (
                <Column
                  key={column.id}
                  column={column}
                  index={index}
                  members={members}
                  tasks={visible.filter((t) => t.status === column.id)}
                  onOpen={setOpenTask}
                  onAction={handleAction}
                />
              ))}
            </div>
            <DragOverlay dropAnimation={{ duration: 180, easing: "ease-out" }}>
              {activeTask ? (
                <div className="w-[248px]">
                  <TaskCard
                    task={activeTask}
                    member={members.find((m) => m.id === activeTask.assigneeId)}
                    onOpen={() => {}}
                    onAction={() => {}}
                    dragging
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      <button
        onClick={() => setModalOpen(true)}
        aria-label="Nova tarefa"
        className="absolute bottom-7 left-1/2 flex h-[38px] w-[38px] -translate-x-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lift transition-transform duration-200 hover:scale-105"
      >
        <Plus size={18} strokeWidth={1.8} />
      </button>

      <NewTaskModal open={modalOpen} members={members} onClose={() => setModalOpen(false)} />
      <TaskDrawer task={openTask} members={members} onClose={() => setOpenTask(null)} />
    </div>
  );
}
