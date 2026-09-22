import api from "./api";

export interface SubjectProgress {
  name: string;
  completion: number;
  totalTasks: number;
  completedTasks: number;
}

export const getSubjectProgress = async (): Promise<
  SubjectProgress[]
> => {
  const response = await api.get(
    "/api/subject-progress",
  );

  return response.data.data;
};