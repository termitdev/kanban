import type { EventCategory, TaskStatus } from "@/types/domain";

export interface ColumnConfig {
  id: TaskStatus;
  label: string;
  /** tailwind class for the thin color rule under the column title */
  rule: string;
  surface: "white" | "lilac" | "pink" | "yellow" | "green" | "grey";
}

export const COLUMNS: ColumnConfig[] = [
  { id: "backlog", label: "Backlog", rule: "bg-surface-grey", surface: "white" },
  { id: "planejamento", label: "Planejamento", rule: "bg-surface-lilac", surface: "grey" },
  { id: "producao", label: "Produção", rule: "bg-highlight", surface: "lilac" },
  { id: "aprovacao", label: "Aprovação", rule: "bg-surface-pink", surface: "pink" },
  { id: "concluido", label: "Concluído", rule: "bg-surface-green", surface: "green" },
];

export const SURFACE_CLASS: Record<ColumnConfig["surface"], string> = {
  white: "bg-surface-white",
  lilac: "bg-surface-lilac",
  pink: "bg-surface-pink",
  yellow: "bg-surface-yellow",
  green: "bg-surface-green",
  grey: "bg-surface-grey",
};

export const TAGS = [
  "Instagram",
  "E-mail",
  "Site",
  "Meta Ads",
  "Google Ads",
  "Design",
  "Vídeo",
  "Conteúdo",
  "SEO",
  "CRM",
  "Evento",
];

export const CHANNELS = ["Instagram", "E-mail", "Site", "Meta Ads", "Google Ads", "Vídeo", "SEO"];

export const PRIORITIES = [
  { id: "baixa", label: "Baixa" },
  { id: "normal", label: "Normal" },
  { id: "alta", label: "Alta" },
] as const;

export const EVENT_CATEGORIES: { id: EventCategory; label: string; dot: string }[] = [
  { id: "reuniao", label: "Reunião", dot: "bg-surface-lilac" },
  { id: "campanha", label: "Campanha", dot: "bg-highlight" },
  { id: "entrega", label: "Entrega", dot: "bg-surface-pink" },
  { id: "evento", label: "Evento", dot: "bg-surface-green" },
  { id: "call", label: "Call", dot: "bg-surface-grey" },
  { id: "planejamento", label: "Planejamento", dot: "bg-surface-lilac" },
  { id: "outro", label: "Outro", dot: "bg-surface-grey" },
];

export const statusLabel = (status: TaskStatus) =>
  COLUMNS.find((c) => c.id === status)?.label ?? status;

export const BUCKETS = [
  { id: "andamento", label: "Em andamento" },
  { id: "backlog", label: "Backlog" },
  { id: "concluido", label: "Concluído" },
  { id: "todos", label: "Todos" },
] as const;
