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

/* ---------- API ---------- */

class TaskService {
  async getTasks(): Promise<Task[]> {
    const response = await api.get('/tasks');
    return response.data;
  }

  async getTask(id: string): Promise<Task> {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  }

  async createTask(payload: CreateTaskPayload): Promise<Task> {
    const response = await api.post('/tasks', payload);
    return response.data;
  }

  async updateTask(
    id: string,
    payload: UpdateTaskPayload
  ): Promise<Task> {
    const response = await api.patch(`/tasks/${id}`, payload);
    return response.data;
  }

  async deleteTask(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  }
}

export const taskService = new TaskService();