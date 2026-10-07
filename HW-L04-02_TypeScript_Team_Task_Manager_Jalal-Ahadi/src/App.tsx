import { FormEvent, useMemo, useState } from "react";
import {
  Link, Navigate, Route, Routes, useNavigate, useParams
} from "react-router-dom";
import { useApp } from "./AppContext";
import type { Priority, Role, Task, TaskStatus } from "./types";

function Shell({ children }: { children: React.ReactNode }) {
  const { activeUser, logout, tasks } = useApp();

  const dueSoon = useMemo(() => {
    const now = new Date();
    const limit = new Date();
    limit.setDate(now.getDate() + 3);
    return tasks.filter(t => {
      if (t.status === "done") return false;
      const due = new Date(`${t.dueDate}T23:59:59`);
      return due >= now && due <= limit;
    });
  }, [tasks]);

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-4">
          <Link to="/projects" className="ml-auto text-xl font-black">TeamFlow</Link>
          <Link to="/projects" className="text-sm text-slate-300 hover:text-white">پروژه‌ها</Link>
          <Link to="/members" className="text-sm text-slate-300 hover:text-white">اعضا</Link>
          <div className="text-xs text-slate-400">{activeUser?.name}</div>
          <button onClick={logout} className="rounded-lg bg-white/10 px-3 py-2 text-xs">خروج</button>
        </div>
      </header>

      {dueSoon.length > 0 && (
        <div className="mx-auto mt-4 max-w-7xl px-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
            <strong>یادآوری:</strong> {dueSoon.length} تسک تا ۳ روز آینده سررسید می‌شود.
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl p-4 md:p-8">{children}</div>
    </main>
  );
}

function Protected({ children }: { children: React.ReactNode }) {
  const { activeUser } = useApp();
  return activeUser ? <>{children}</> : <Navigate to="/login" replace />;
}

function AuthPage({ mode }: { mode: "login" | "register" }) {
  const { login, register, activeUser } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState(mode === "login" ? "demo@example.com" : "");
  const [password, setPassword] = useState(mode === "login" ? "123456" : "");
  const [error, setError] = useState("");

  if (activeUser) return <Navigate to="/projects" replace />;

  function submit(e: FormEvent) {
    e.preventDefault();
    const ok = mode === "login"
      ? login(email, password)
      : register(name.trim(), email.trim(), password);
    if (!ok) return setError(mode === "login" ? "ایمیل یا رمز عبور اشتباه است." : "این ایمیل قبلاً ثبت شده است.");
    navigate("/projects");
  }

  return (
    <main dir="rtl" className="grid min-h-screen place-items-center bg-slate-950 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
        <p className="text-sm font-bold text-indigo-600">TeamFlow</p>
        <h1 className="mt-2 text-3xl font-black">{mode === "login" ? "ورود" : "ثبت‌نام"}</h1>
        <div className="mt-6 space-y-3">
          {mode === "register" && <input value={name} onChange={e => setName(e.target.value)} placeholder="نام" className="w-full rounded-xl border px-4 py-3" required />}
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="ایمیل" className="w-full rounded-xl border px-4 py-3" required />
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="رمز عبور" className="w-full rounded-xl border px-4 py-3" required />
          {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}
          <button className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white">{mode === "login" ? "ورود" : "ساخت حساب"}</button>
        </div>
        <p className="mt-4 text-center text-sm text-slate-500">
          {mode === "login" ? <Link to="/register" className="text-indigo-600">ثبت‌نام</Link> : <Link to="/login" className="text-indigo-600">ورود</Link>}
        </p>
      </form>
    </main>
  );
}

function MembersPage() {
  const { members, addMember } = useApp();
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("member");

  return (
    <Shell>
      <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">افزودن عضو</h2>
          <div className="mt-4 space-y-3">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="نام عضو" className="w-full rounded-xl border px-3 py-3" />
            <select value={role} onChange={e => setRole(e.target.value as Role)} className="w-full rounded-xl border px-3 py-3">
              <option value="manager">مدیر</option>
              <option value="member">عضو عادی</option>
            </select>
            <button onClick={() => { if (name.trim()) { addMember({ name: name.trim(), role }); setName(""); } }} className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white">افزودن</button>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">اعضای تیم</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {members.map(m => (
              <div key={m.id} className="rounded-xl border p-4">
                <strong>{m.name}</strong>
                <p className="mt-1 text-sm text-slate-500">{m.role === "manager" ? "مدیر" : "عضو عادی"}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Shell>
  );
}

function ProjectsPage() {
  const { projects, addProject, tasks } = useApp();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const id = addProject({ title: title.trim(), description: description.trim() });
    setTitle(""); setDescription("");
    navigate(`/projects/${id}`);
  }

  return (
    <Shell>
      <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <form onSubmit={submit} className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">پروژه جدید</h2>
          <div className="mt-4 space-y-3">
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="عنوان" className="w-full rounded-xl border px-3 py-3" />
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="توضیح" className="min-h-28 w-full rounded-xl border px-3 py-3" />
            <button className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white">ساخت پروژه</button>
          </div>
        </form>

        <div>
          <h1 className="text-3xl font-black">پروژه‌ها</h1>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {projects.map(p => {
              const count = tasks.filter(t => t.projectId === p.id).length;
              return (
                <Link key={p.id} to={`/projects/${p.id}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <div><h2 className="text-xl font-black">{p.title}</h2><p className="mt-2 text-sm text-slate-500">{p.description}</p></div>
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">{count} تسک</span>
                  </div>
                  <p className="mt-4 text-xs text-slate-400">ایجاد: {p.createdAt}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </Shell>
  );
}

function ProjectPage() {
  const { projectId } = useParams();
  const { projects, tasks, members, addTask, updateTask, deleteTask } = useApp();
  const project = projects.find(p => p.id === projectId);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | TaskStatus>("all");
  const [priority, setPriority] = useState<"all" | Priority>("all");
  const [assigneeId, setAssigneeId] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [editing, setEditing] = useState<Task | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium" as Priority,
    status: "todo" as TaskStatus,
    dueDate: new Date().toISOString().slice(0, 10),
    assigneeId: members[0]?.id ?? ""
  });

  if (!project) return <Navigate to="/projects" replace />;

  const filtered = tasks.filter(t => {
    if (t.projectId !== project.id) return false;
    return (!search || t.title.toLowerCase().includes(search.toLowerCase()))
      && (status === "all" || t.status === status)
      && (priority === "all" || t.priority === priority)
      && (assigneeId === "all" || t.assigneeId === assigneeId)
      && (!fromDate || t.dueDate >= fromDate)
      && (!toDate || t.dueDate <= toDate);
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    addTask({ ...form, projectId: project.id, title: form.title.trim() });
    setForm(v => ({ ...v, title: "", description: "" }));
  }

  function saveEdit() {
    if (!editing) return;
    updateTask(editing);
    setEditing(null);
  }

  return (
    <Shell>
      <div className="mb-5">
        <Link to="/projects" className="text-sm text-indigo-600">← بازگشت به پروژه‌ها</Link>
        <h1 className="mt-2 text-3xl font-black">{project.title}</h1>
        <p className="mt-1 text-slate-500">{project.description}</p>
      </div>

      <section className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <form onSubmit={submit} className="h-fit rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">تسک جدید</h2>
          <div className="mt-4 space-y-3">
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="عنوان" className="w-full rounded-xl border px-3 py-3" />
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="توضیح" className="min-h-24 w-full rounded-xl border px-3 py-3" />
            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as Priority })} className="w-full rounded-xl border px-3 py-3">
              <option value="low">اولویت کم</option><option value="medium">متوسط</option><option value="high">زیاد</option>
            </select>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as TaskStatus })} className="w-full rounded-xl border px-3 py-3">
              <option value="todo">To Do</option><option value="in-progress">در حال انجام</option><option value="done">انجام شده</option>
            </select>
            <input value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} type="date" className="w-full rounded-xl border px-3 py-3" />
            <select value={form.assigneeId} onChange={e => setForm({ ...form, assigneeId: e.target.value })} className="w-full rounded-xl border px-3 py-3">
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <button className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white">افزودن تسک</button>
          </div>
        </form>

        <div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="جستجوی عنوان" className="rounded-lg border px-3 py-2" />
              <select value={status} onChange={e => setStatus(e.target.value as "all" | TaskStatus)} className="rounded-lg border px-3 py-2">
                <option value="all">همه وضعیت‌ها</option><option value="todo">To Do</option><option value="in-progress">در حال انجام</option><option value="done">انجام شده</option>
              </select>
              <select value={priority} onChange={e => setPriority(e.target.value as "all" | Priority)} className="rounded-lg border px-3 py-2">
                <option value="all">همه اولویت‌ها</option><option value="low">کم</option><option value="medium">متوسط</option><option value="high">زیاد</option>
              </select>
              <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} className="rounded-lg border px-3 py-2">
                <option value="all">همه اعضا</option>{members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="rounded-lg border px-3 py-2" />
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="rounded-lg border px-3 py-2" />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {filtered.map(t => {
              const member = members.find(m => m.id === t.assigneeId);
              return (
                <article key={t.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  {editing?.id === t.id ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} className="rounded-lg border px-3 py-2" />
                      <input value={editing.dueDate} onChange={e => setEditing({ ...editing, dueDate: e.target.value })} type="date" className="rounded-lg border px-3 py-2" />
                      <select value={editing.priority} onChange={e => setEditing({ ...editing, priority: e.target.value as Priority })} className="rounded-lg border px-3 py-2">
                        <option value="low">کم</option><option value="medium">متوسط</option><option value="high">زیاد</option>
                      </select>
                      <select value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value as TaskStatus })} className="rounded-lg border px-3 py-2">
                        <option value="todo">To Do</option><option value="in-progress">در حال انجام</option><option value="done">انجام شده</option>
                      </select>
                      <select value={editing.assigneeId} onChange={e => setEditing({ ...editing, assigneeId: e.target.value })} className="rounded-lg border px-3 py-2">
                        {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                      <div className="flex gap-2">
                        <button onClick={saveEdit} type="button" className="rounded-lg bg-emerald-600 px-4 py-2 font-bold text-white">ذخیره</button>
                        <button onClick={() => setEditing(null)} type="button" className="rounded-lg bg-slate-100 px-4 py-2">لغو</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-black">{t.title}</h3>
                          <p className="mt-1 text-sm text-slate-500">{t.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setEditing(t)} className="rounded-lg bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-700">ویرایش</button>
                          <button onClick={() => deleteTask(t.id)} className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-bold text-rose-600">حذف</button>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-slate-100 px-3 py-1">وضعیت: {t.status}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1">اولویت: {t.priority}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1">مسئول: {member?.name ?? "-"}</span>
                        <span className="rounded-full bg-slate-100 px-3 py-1">سررسید: {t.dueDate}</span>
                      </div>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </Shell>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/projects" element={<Protected><ProjectsPage /></Protected>} />
      <Route path="/projects/:projectId" element={<Protected><ProjectPage /></Protected>} />
      <Route path="/members" element={<Protected><MembersPage /></Protected>} />
      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  );
}
