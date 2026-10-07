import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Account, AppState, Member, Project, Task } from "./types";

type ContextValue = AppState & {
  activeUser: Account | null;
  register: (name: string, email: string, password: string) => boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addMember: (data: Omit<Member, "id">) => void;
  addProject: (data: Omit<Project, "id" | "createdAt">) => string;
  addTask: (data: Omit<Task, "id">) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
};

const KEY = "hw-l04-02-team-manager";

const seed: AppState = {
  members: [
    { id: "m1", name: "سعید", role: "manager" },
    { id: "m2", name: "علی", role: "member" },
    { id: "m3", name: "سارا", role: "member" }
  ],
  projects: [
    { id: "p1", title: "وب‌سایت شرکت", description: "طراحی و پیاده‌سازی نسخه جدید سایت", createdAt: "2026-10-01" }
  ],
  tasks: [
    { id: "t1", projectId: "p1", title: "طراحی صفحه اصلی", description: "نسخه اولیه UI", priority: "high", status: "in-progress", dueDate: "2026-10-08", assigneeId: "m2" },
    { id: "t2", projectId: "p1", title: "بررسی محتوا", description: "بازبینی متن‌ها", priority: "medium", status: "todo", dueDate: "2026-10-10", assigneeId: "m3" }
  ],
  accounts: [
    { id: "u1", name: "Demo User", email: "demo@example.com", password: "123456" }
  ],
  currentUserId: null
};

const AppContext = createContext<ContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(KEY);
    return saved ? JSON.parse(saved) : seed;
  });

  useEffect(() => localStorage.setItem(KEY, JSON.stringify(state)), [state]);

  const activeUser = state.accounts.find(a => a.id === state.currentUserId) ?? null;

  function register(name: string, email: string, password: string) {
    if (state.accounts.some(a => a.email.toLowerCase() === email.toLowerCase())) return false;
    const account: Account = { id: crypto.randomUUID(), name, email, password };
    setState(s => ({ ...s, accounts: [...s.accounts, account], currentUserId: account.id }));
    return true;
  }

  function login(email: string, password: string) {
    const account = state.accounts.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
    if (!account) return false;
    setState(s => ({ ...s, currentUserId: account.id }));
    return true;
  }

  const value = useMemo<ContextValue>(() => ({
    ...state,
    activeUser,
    register,
    login,
    logout: () => setState(s => ({ ...s, currentUserId: null })),
    addMember: data => setState(s => ({ ...s, members: [...s.members, { ...data, id: crypto.randomUUID() }] })),
    addProject: data => {
      const id = crypto.randomUUID();
      setState(s => ({
        ...s,
        projects: [...s.projects, { ...data, id, createdAt: new Date().toISOString().slice(0, 10) }]
      }));
      return id;
    },
    addTask: data => setState(s => ({ ...s, tasks: [...s.tasks, { ...data, id: crypto.randomUUID() }] })),
    updateTask: task => setState(s => ({ ...s, tasks: s.tasks.map(t => t.id === task.id ? task : t) })),
    deleteTask: id => setState(s => ({ ...s, tasks: s.tasks.filter(t => t.id !== id) }))
  }), [state, activeUser]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be inside AppProvider");
  return value;
}
