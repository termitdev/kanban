import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { Avatar } from "@/components/layout/Avatar";
import { PRIORITIES, statusLabel } from "@/lib/board-config";
import { useUpdateTask } from "@/hooks/useTasks";
import type { Member, Task, TaskPriority } from "@/types/domain";

interface Props {
  task: Task | null;
  members: Member[];
  onClose: () => void;
}

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

export function TaskDrawer({ task, members, onClose }: Props) {
  const update = useUpdateTask();
  const member = members.find((m) => m.id === task?.assigneeId);

  return (
    <AnimatePresence>
      {task ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-foreground/10"
          />
          <motion.aside
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="scroll-thin fixed right-0 top-0 z-50 h-full w-full max-w-[420px] overflow-y-auto border-l border-border bg-panel p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  {task.campaign ?? "Sem campanha"}
                </p>
                <h2 className="mt-1 text-[20px] font-semibold leading-tight tracking-[-0.03em]">
                  {task.title}
                </h2>
              </div>
              <button aria-label="Fechar" onClick={onClose} className="icon-button">
                <X size={14} strokeWidth={1.7} />
              </button>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 text-[12px]">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.07em] text-muted-foreground">
                  Status
                </dt>
                <dd className="mt-1 font-medium">{statusLabel(task.status)}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.07em] text-muted-foreground">
                  Responsável
                </dt>
                <dd className="mt-1 flex items-center gap-1.5 font-medium">
                  <Avatar member={member} size="xs" />
                  {member?.name ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.07em] text-muted-foreground">
                  Prazo
                </dt>
                <dd className="mt-1 font-medium">{formatDate(task.dueDate)}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.07em] text-muted-foreground">
                  Prioridade
                </dt>
                <dd className="mt-1">
                  <select
                    value={task.priority}
                    onChange={(e) =>
                      update.mutate({
                        id: task.id,
                        patch: { priority: e.target.value as TaskPriority },
                      })
                    }
                    className="field focus:field-focus"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </dd>
              </div>
            </dl>

            <section className="mt-6">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Progresso
              </h3>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={task.progress}
                  onChange={(e) =>
                    update.mutate({ id: task.id, patch: { progress: Number(e.target.value) } })
                  }
                  className="w-full accent-[oklch(0.18_0_0)]"
                />
                <span className="w-9 text-right text-[12px] font-medium">{task.progress}%</span>
              </div>
            </section>

            <section className="mt-6">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Descrição
              </h3>
              <p className="mt-2 text-[12px] leading-relaxed text-foreground/70">
                {task.description ?? "Sem descrição para esta tarefa."}
              </p>
            </section>

            {task.tags.length > 0 ? (
              <section className="mt-6">
                <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Etiquetas
                </h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {task.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-medium text-foreground/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="mt-6">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Checklist
              </h3>
              {task.checklist.length === 0 ? (
                <p className="mt-2 text-[11px] text-muted-foreground">Nenhum item.</p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {task.checklist.map((item, index) => (
                    <li key={item.label}>
                      <button
                        onClick={() =>
                          update.mutate({
                            id: task.id,
                            patch: {
                              checklist: task.checklist.map((c, i) =>
                                i === index ? { ...c, done: !c.done } : c,
                              ),
                            },
                          })
                        }
                        className="flex w-full items-center gap-2 rounded-[9px] px-1 py-1 text-left text-[12px] hover:bg-secondary"
                      >
                        <span
                          className={
                            item.done
                              ? "h-3.5 w-3.5 rounded-[4px] bg-primary"
                              : "h-3.5 w-3.5 rounded-[4px] border border-border"
                          }
                        />
                        <span className={item.done ? "text-foreground/45 line-through" : ""}>
                          {item.label}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="mt-6">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Comentários
              </h3>
              <textarea
                rows={3}
                placeholder="Escreva um comentário..."
                className="field focus:field-focus mt-2 resize-none"
              />
            </section>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
