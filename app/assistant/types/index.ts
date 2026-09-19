export interface ActionButton {
  label: string;
  icon: string;
  action: () => void;
}

export type CustomWidgetType = 'focus' | 'stats' | 'task-detail' | 'expense-list';

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

export interface QuickActionItem {
  label: string;
  query: string;
}
