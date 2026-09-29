import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { COLUMNS, PRIORITIES } from "@/lib/board-config";
import { useCreateTask } from "@/hooks/useTasks";
import type { Member, TaskPriority, TaskStatus } from "@/types/domain";

interface Props {
  open: boolean;
  members: Member[];
  onClose: () => void;
}

export function NewTaskModal({ open, members, onClose }: Props) {
  const create = useCreateTask();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [campaign, setCampaign] = useState("");
  const [status, setStatus] = useState<TaskStatus>("backlog");

  const submit = async () => {
    if (!title.trim()) return;
    await create.mutateAsync({
      title: title.trim(),
      description,
      assigneeId,
      dueDate,
      priority,
      campaign,
      status,
    });
    setTitle("");
    setDescription("");
    setCampaign("");
    setDueDate("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-foreground/15"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative w-full max-w-[420px] rounded-[18px] border border-border bg-panel p-6 shadow-lift"
          >
            <h2 className="text-[17px] font-semibold tracking-[-0.03em]">Nova tarefa</h2>

            <div className="mt-5 space-y-3">
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                  Título
                </span>
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="field focus:field-focus mt-1"
                />
              </label>

              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                  Descrição
                </span>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="field focus:field-focus mt-1 resize-none"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                    Responsável
                  </span>
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="field focus:field-focus mt-1"
                  >
                    <option value="">Selecionar</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                    Prazo
                  </span>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="field focus:field-focus mt-1"
                  />
                </label>

                <label className="block">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                    Prioridade
                  </span>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="field focus:field-focus mt-1"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                    Coluna
                  </span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="field focus:field-focus mt-1"
                  >
                    {COLUMNS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                  Projeto / Campanha
                </span>
                <input
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  className="field focus:field-focus mt-1"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="rounded-full border border-border px-4 py-2 text-[12px] font-medium text-foreground/70 transition-colors hover:bg-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={submit}
                disabled={create.isPending || !title.trim()}
                className="rounded-full bg-primary px-4 py-2 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                Criar tarefa
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
