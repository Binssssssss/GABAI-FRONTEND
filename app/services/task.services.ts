import api from '@/app/services/api';

/* ---------- Types ---------- */

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  taskId: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  subject: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  dueTime: string;
  hasReminder: boolean;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  subTasks: SubTask[];
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  subject: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  dueTime: string;
  hasReminder: boolean;
  subTasks: string[];
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  subject?: string;
  priority?: 'High' | 'Medium' | 'Low';
  dueDate?: string;
  dueTime?: string;
  hasReminder?: boolean;
  completed?: boolean;
  subTasks?: string[];
}

/* ---------- Task Recommendation ---------- */

export type TaskRecommendationUrgency =
  | 'CRITICAL'
  | 'HIGH'
  | 'MEDIUM'
  | 'LOW';

export interface TaskRecommendation {
  hasRecommendation: boolean;
  taskId?: string;
  title?: string;
  subject?: string;
  priority?: 'High' | 'Medium' | 'Low';
  dueDate?: string;
  dueTime?: string | null;
  urgency?: TaskRecommendationUrgency;
  reason?: string;
  task?: null;
  message?: string;
}

/* ---------- Recommendation helpers ---------- */

const CAUGHT_UP: TaskRecommendation = {
  hasRecommendation: false,
  task: null,
  message: "You're all caught up!",
};

/** Whole days from today to a "YYYY-MM-DD" date (negative = overdue). */
const daysUntil = (dueDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(`${dueDate}T00:00:00`);

  return Math.round((due.getTime() - today.getTime()) / 86400000);
};

/*
 * The backend (GET /tasks/recommendation) sends back the next task
 * itself, or null when nothing is pending:
 *   { success: true, data: Task | null }
 * The card expects a TaskRecommendation, so turn the task into one here.
 * Without this, `hasRecommendation` was always missing and the card
 * kept saying "You're all caught up!" even with unfinished tasks.
 */
const toTaskRecommendation = (data: any): TaskRecommendation => {
  if (!data) {
    return CAUGHT_UP;
  }

  // Already in recommendation shape (older backend): use it as is.
  if (typeof data.hasRecommendation === 'boolean') {
    return data;
  }

  // A plain task.
  if (!data.id || data.completed) {
    return CAUGHT_UP;
  }

  let urgency: TaskRecommendationUrgency = 'LOW';
  let reason = 'This is your next deadline.';

  if (data.dueDate) {
    const days = daysUntil(data.dueDate);

    if (days < 0) {
      urgency = 'CRITICAL';
      reason = 'This task is overdue. Finish it first.';
    } else if (days === 0) {
      urgency = 'HIGH';
      reason = 'Due today. It has your earliest deadline.';
    } else if (days <= 2) {
      urgency = 'MEDIUM';
      reason = 'Due soon. Starting now keeps you ahead.';
    }
  }

  return {
    hasRecommendation: true,
    taskId: data.id,
    title: data.title,
    subject: data.subject,
    priority: data.priority,
    dueDate: data.dueDate,
    dueTime: data.dueTime ?? null,
    urgency,
    reason,
  };
};

/* ---------- API ---------- */

class TaskService {
  // ===============================
  // GET ALL TASKS
  // ===============================

  async getTasks(): Promise<Task[]> {
    const response = await api.get('/tasks');

    const result = response.data;

    // Backend response:
    // {
    //   success: true,
    //   data: Task[]
    // }

    if (Array.isArray(result)) {
      return result;
    }

    if (Array.isArray(result?.data)) {
      return result.data;
    }

    return [];
  }

  // ===============================
  // GET TASK RECOMMENDATION
  // ===============================

  async getTaskRecommendation(): Promise<TaskRecommendation> {
    const response = await api.get(
      '/tasks/recommendation',
    );

    const result = response.data;

    // Backend response:
    // {
    //   success: true,
    //   data: {
    //     hasRecommendation: true,
    //     taskId: "...",
    //     title: "...",
    //     ...
    //   }
    // }

    return toTaskRecommendation(result?.data);
  }
  async updateSubTask(
  taskId: string,
  subTaskId: string,
  completed: boolean
)

{
  const response = await api.patch(
    `/tasks/${taskId}/subtasks/${subTaskId}`,
    { completed }
  );

  return response.data;
}

  // ===============================
  // GET TASK BY ID
  // ===============================

  async getTask(id: string): Promise<Task> {
    const response = await api.get(`/tasks/${id}`);

    const result = response.data;

    if (result?.data) {
      return result.data;
    }

    return result;
  }

  // ===============================
  // CREATE TASK
  // ===============================

  async createTask(
    payload: CreateTaskPayload,
  ): Promise<Task> {
    const response = await api.post(
      '/tasks',
      payload,
    );

    const result = response.data;

    if (result?.data) {
      return result.data;
    }

    return result;
  }

  // ===============================
  // UPDATE TASK
  // ===============================

  async updateTask(
    id: string,
    payload: UpdateTaskPayload,
  ): Promise<Task> {
    const response = await api.patch(
      `/tasks/${id}`,
      payload,
    );

    const result = response.data;

    if (result?.data) {
      return result.data;
    }

    return result;
  }

  // ===============================
  // DELETE TASK
  // ===============================

  async deleteTask(
    id: string,
  ): Promise<{ message: string }> {
    const response = await api.delete(
      `/tasks/${id}`,
    );

    const result = response.data;

    if (result?.data) {
      return result.data;
    }

    return result;
  }
}

export const taskService = new TaskService();
