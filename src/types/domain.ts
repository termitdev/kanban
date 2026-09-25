export type TaskStatus = "backlog" | "planejamento" | "producao" | "aprovacao" | "concluido";
export type TaskPriority = "baixa" | "normal" | "alta";
export type MemberRole = "admin" | "manager" | "member";
export type EventCategory =
  | "reuniao"
  | "campanha"
  | "entrega"
  | "evento"
  | "call"
  | "planejamento"
  | "outro";

export interface ChecklistItem {
  label: string;
  done: boolean;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  accent: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  campaign: string | null;
  channel: string | null;
  tags: string[];
  checklist: ChecklistItem[];
  progress: number;
  position: number;
  dueDate: string | null;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  date: string;
  startTime: string | null;
  endTime: string | null;
  memberId: string | null;
  category: EventCategory;
  taskId: string | null;
}

export interface TaskFilters {
  assignees: string[];
  priorities: TaskPriority[];
  channels: string[];
  campaigns: string[];
  tags: string[];
  search: string;
  bucket: "andamento" | "backlog" | "concluido" | "todos";
}

export const emptyFilters: TaskFilters = {
  assignees: [],
  priorities: [],
  channels: [],
  campaigns: [],
  tags: [],
  search: "",
  bucket: "todos",
};
