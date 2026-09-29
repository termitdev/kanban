import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { EVENT_CATEGORIES } from "@/lib/board-config";
import { useCreateEvent } from "@/hooks/useEvents";
import type { EventCategory, Member } from "@/types/domain";

interface Props {
  open: boolean;
  date: string;
  members: Member[];
  onClose: () => void;
}

export function NewEventModal({ open, date, members, onClose }: Props) {
  const create = useCreateEvent();
  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState(date);
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("15:00");
  const [memberId, setMemberId] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<EventCategory>("reuniao");

  useEffect(() => setEventDate(date), [date]);

  const submit = async () => {
    if (!title.trim()) return;
    await create.mutateAsync({
      title: title.trim(),
      date: eventDate,
      startTime,
      endTime,
      memberId,
      description,
      category,
    });
    setTitle("");
    setDescription("");
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
            className="relative w-full max-w-[400px] rounded-[18px] border border-border bg-panel p-6 shadow-lift"
          >
            <h2 className="text-[17px] font-semibold tracking-[-0.03em]">Novo compromisso</h2>

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

              <div className="grid grid-cols-3 gap-3">
                <label className="block">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                    Data
                  </span>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="field focus:field-focus mt-1"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                    Início
                  </span>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="field focus:field-focus mt-1"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                    Fim
                  </span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="field focus:field-focus mt-1"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.07em] text-muted-foreground">
                    Responsável
                  </span>
                  <select
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
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
                    Categoria
                  </span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as EventCategory)}
                    className="field focus:field-focus mt-1"
                  >
                    {EVENT_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

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
                Criar compromisso
              </button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
