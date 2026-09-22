import api from "./api";

export interface SmartReminderResponse {
  hasReminder: boolean;
  reminderText: string | null;
  type:
    | "overdue_tasks"
    | "urgent_tasks"
    | "upcoming_deadline"
    | "high_priority"
    | "pending_tasks"
    | "no_reminder";
}

export const getSmartReminder = async (): Promise<SmartReminderResponse> => {
  const response = await api.get("/api/smart-reminders");

  return response.data.data;
};