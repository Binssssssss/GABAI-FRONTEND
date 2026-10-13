import api from "./api";
import { loadNotificationPrefs } from "./notificationPrefs";

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
  const prefs = await loadNotificationPrefs();

  if (!prefs.smartReminders) {
    return { hasReminder: false, reminderText: null, type: "no_reminder" };
  }

  const response = await api.get("/smart-reminders");

  return response.data.data;
};