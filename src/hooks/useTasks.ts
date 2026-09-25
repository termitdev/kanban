import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ChecklistItem, Task, TaskPriority, TaskStatus } from "@/types/domain";

export const tasksQueryKey = ["tasks"] as const;

type Row = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assignee_id: string | null;
  campaign: string | null;
  channel: string | null;
  tags: string[] | null;
  checklist: unknown;
  progress: number;
  position: number;
  due_date: string | null;
  blocked: boolean;
  created_at: string;
  updated_at: string;
};

const toTask = (row: Row): Task => ({
  id: row.id,
  title: row.title,
  description: row.description,
  status: row.status as TaskStatus,
  priority: row.priority as TaskPriority,
  assigneeId: row.assignee_id,
  campaign: row.campaign,
  channel: row.channel,
  tags: row.tags ?? [],
  checklist: Array.isArray(row.checklist) ? (row.checklist as ChecklistItem[]) : [],
  progress: row.progress,
  position: row.position,
  dueDate: row.due_date,
  blocked: row.blocked,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export function useTasks() {
  return useQuery({
    queryKey: tasksQueryKey,
    queryFn: async (): Promise<Task[]> => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      return (data as Row[]).map(toTask);
    },
  });
}

export interface NewTaskInput {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string | null;
  campaign?: string | null;
  channel?: string | null;
  tags?: string[];
  dueDate?: string | null;
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewTaskInput) => {
      const { error } = await supabase.from("tasks").insert({
        title: input.title,
        description: input.description ?? null,
        status: input.status,
        priority: input.priority,
        assignee_id: input.assigneeId || null,
        campaign: input.campaign || null,
        channel: input.channel || null,
        tags: input.tags ?? [],
        due_date: input.dueDate || null,
        progress: 0,
        position: Date.now() % 100000,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: tasksQueryKey }),
  });
}

export interface TaskPatch {
  status?: TaskStatus;
  priority?: TaskPriority;
  title?: string;
  description?: string | null;
  assigneeId?: string | null;
  progress?: number;
  position?: number;
  dueDate?: string | null;
  checklist?: ChecklistItem[];
  tags?: string[];
  blocked?: boolean;
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: TaskPatch }) => {
      const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (patch.status !== undefined) payload["status"] = patch.status;
      if (patch.priority !== undefined) payload["priority"] = patch.priority;
      if (patch.title !== undefined) payload["title"] = patch.title;
      if (patch.description !== undefined) payload["description"] = patch.description;
      if (patch.assigneeId !== undefined) payload["assignee_id"] = patch.assigneeId;
      if (patch.progress !== undefined) payload["progress"] = patch.progress;
      if (patch.position !== undefined) payload["position"] = patch.position;
      if (patch.dueDate !== undefined) payload["due_date"] = patch.dueDate;
      if (patch.checklist !== undefined) payload["checklist"] = patch.checklist;
      if (patch.tags !== undefined) payload["tags"] = patch.tags;
      if (patch.blocked !== undefined) payload["blocked"] = patch.blocked;

      const { error } = await supabase.from("tasks").update(payload).eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: tasksQueryKey });
      const previous = qc.getQueryData<Task[]>(tasksQueryKey);
      if (previous) {
        qc.setQueryData<Task[]>(
          tasksQueryKey,
          previous.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        );
      }
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(tasksQueryKey, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: tasksQueryKey }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: tasksQueryKey }),
  });
}
