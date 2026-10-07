export type Role = "manager" | "member";
export type Priority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in-progress" | "done";

export type Member = {
  id: string;
  name: string;
  role: Role;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
};

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
  assigneeId: string;
};

export type Account = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type AppState = {
  members: Member[];
  projects: Project[];
  tasks: Task[];
  accounts: Account[];
  currentUserId: string | null;
};
