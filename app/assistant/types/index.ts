export interface ActionButton {
  label: string;
  icon: string;
  action: () => void;
}

export type CustomWidgetType =
  | 'focus'
  | 'stats'
  | 'task-detail'
  | 'expense-list'
  | 'summary';

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actions?: ActionButton[];
  customWidget?: CustomWidgetType;
  widgetData?: any;
}

export interface SuggestionChipItem {
  text: string;
  icon: string;
}

/** The five GabAi quick actions. Each one answers about its feature only. */
export type QuickActionKey = 'tasks' | 'schedule' | 'wallet' | 'focus' | 'notes';

export interface QuickActionItem {
  key: QuickActionKey;
  label: string;
  icon: string;
}

/* ---------- Summary card shown for a quick action ---------- */

export interface SummaryStat {
  value: string;
  label: string;
  color?: string;
}

export interface SummaryItem {
  title: string;
  subtitle?: string;
  right?: string;
  rightSub?: string;
  rightColor?: string;
  /** Color of the bar on the left of the row. */
  color: string;
  badge?: { text: string; color: string };
}

export interface SummaryBar {
  label: string;
  value: number;
  display: string;
  color: string;
}

export interface SummarySection {
  title: string;
  items?: SummaryItem[];
  bars?: SummaryBar[];
  empty?: string;
}

export interface SummaryButton {
  label: string;
  icon: string;
  route: string;
  primary?: boolean;
}

/** Text with **bold** parts, e.g. "You have **4 open tasks**." */
export interface SummaryCardData {
  icon: string;
  title: string;
  meta?: string;
  lead: string;
  stats?: SummaryStat[];
  sections?: SummarySection[];
  tip?: string;
  buttons: SummaryButton[];
}