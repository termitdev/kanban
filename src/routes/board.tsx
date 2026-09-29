import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { Board } from "@/components/kanban/Board";

export const Route = createFileRoute("/board")({
  ssr: false,
  component: BoardPage,
});

function BoardPage() {
  return (
    <AppShell>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <Board />
      </div>
    </AppShell>
  );
}
