import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { MonthCalendar } from "@/components/calendar/MonthCalendar";

export const Route = createFileRoute("/calendar")({
  ssr: false,
  component: CalendarPage,
});

function CalendarPage() {
  return (
    <AppShell>
      <MonthCalendar />
    </AppShell>
  );
}
