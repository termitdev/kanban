import { motion } from "motion/react";
import { Avatar } from "@/components/layout/Avatar";
import { cn } from "@/lib/utils";
import type { Member, Task } from "@/types/domain";

interface Props {
  members: Member[];
  tasks: Task[];
  selected: string[];
  onSelect: (id: string) => void;
}

export function TeamOverview({ members, tasks, selected, onSelect }: Props) {
  const counts = members.map((m) => ({
    member: m,
    count: tasks.filter((t) => t.assigneeId === m.id && t.status !== "concluido").length,
  }));
  const max = Math.max(1, ...counts.map((c) => c.count));

  return (
    <div className="flex items-center gap-5 overflow-x-auto">
      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Equipe
      </span>
      {counts.map(({ member, count }) => {
        const active = selected.includes(member.id);
        return (
          <motion.button
            key={member.id}
            whileHover={{ y: -1 }}
            onClick={() => onSelect(member.id)}
            title={`${member.name} · ${count} tarefas`}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-[12px] px-2 py-1 transition-colors",
              active ? "bg-secondary" : "hover:bg-secondary/60",
            )}
          >
            <Avatar member={member} size="md" />
            <span className="text-left">
              <span className="block text-[12px] font-semibold leading-tight">{member.name}</span>
              <span className="block text-[10px] text-muted-foreground">{count} tarefas</span>
              <span className="mt-1 block h-[3px] w-16 overflow-hidden rounded-full bg-foreground/10">
                <span
                  className="block h-full rounded-full bg-foreground/60"
                  style={{ width: `${(count / max) * 100}%` }}
                />
              </span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
