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

    if (result?.data) {
      return result.data;
    }

    return {
      hasRecommendation: false,
      task: null,
      message: "You're all caught up!",
    };
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
