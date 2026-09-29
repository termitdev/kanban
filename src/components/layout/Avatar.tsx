import { accentClass, initialsOf } from "@/hooks/useMembers";
import { cn } from "@/lib/utils";
import type { Member } from "@/types/domain";

interface AvatarProps {
  member?: Member | null | undefined;
  size?: "xs" | "sm" | "md" | "lg" | undefined;
  className?: string | undefined;
}

const SIZES = {
  xs: "h-5 w-5 text-[9px]",
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-[11px]",
  lg: "h-11 w-11 text-[13px]",
};

export function Avatar({ member, size = "sm", className }: AvatarProps) {
  return (
    <span
      title={member?.name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-border/70 font-semibold text-foreground/80",
        SIZES[size],
        member ? accentClass(member.accent) : "bg-surface-grey",
        className,
      )}
    >
      {member ? initialsOf(member.name) : "—"}
    </span>
  );
}
