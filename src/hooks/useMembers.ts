import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Member, MemberRole } from "@/types/domain";

export const membersQueryKey = ["members"] as const;

export function useMembers() {
  return useQuery({
    queryKey: membersQueryKey,
    queryFn: async (): Promise<Member[]> => {
      const { data, error } = await supabase
        .from("members")
        .select("id, name, email, role, accent")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role as MemberRole,
        accent: row.accent,
      }));
    },
  });
}

export const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export const accentClass = (accent: string) => {
  switch (accent) {
    case "lilac":
      return "bg-surface-lilac";
    case "pink":
      return "bg-surface-pink";
    case "green":
      return "bg-surface-green";
    case "yellow":
      return "bg-surface-yellow";
    default:
      return "bg-surface-grey";
  }
};
