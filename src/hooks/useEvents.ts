import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CalendarEvent, EventCategory } from "@/types/domain";

export const eventsQueryKey = ["events"] as const;

export function useEvents() {
  return useQuery({
    queryKey: eventsQueryKey,
    queryFn: async (): Promise<CalendarEvent[]> => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        date: row.event_date,
        startTime: row.start_time,
        endTime: row.end_time,
        memberId: row.member_id,
        category: row.category as EventCategory,
        taskId: row.task_id,
      }));
    },
  });
}

export interface NewEventInput {
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  memberId?: string | null;
  category: EventCategory;
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewEventInput) => {
      const { error } = await supabase.from("events").insert({
        title: input.title,
        description: input.description ?? null,
        event_date: input.date,
        start_time: input.startTime || null,
        end_time: input.endTime || null,
        member_id: input.memberId || null,
        category: input.category,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: eventsQueryKey }),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: eventsQueryKey }),
  });
}
