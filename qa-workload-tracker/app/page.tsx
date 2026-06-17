"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

type Member = {
  id: string;
  name: string;
  role: string;
  dailyCapacity: number;
  skills: string[];
  status: "Active" | "Inactive";
};

type Task = {
  id: string;
  name: string;
  module: string;
  workType: string;
  requiredSkill: string;
  assignedTo: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: string;
  startDate: string;
  dueDate: string;
  estimatedHours: number;
  adjustedRemaining?: number;
  blocked: boolean;
  blockerType: string;
  blockerNote: string;
  blockedSince: string;
  notes: string;
};

type Allocation = {
  id: string;
  date: string;
  memberId: string;
  taskId: string;
  plannedHours: number;
  actualHours?: number;
  note: string;
};

type Unavailable = {
  id: string;
  date: string;
  memberId: string | "all";
  type: string;
  hours: number;
  reason: string;
};

type UrgentInput = {
  name: string;
  workType: string;
  requiredSkill: string;
  estimatedHours: number;
  deadline: string;
  priority: "Critical" | "High";
  preferredMemberId: string;
};

const modules = ["HRIS", "Payroll", "Attendance", "Leave", "Employee", "Company", "Recruitment", "Reports", "Settings", "Mobile App", "Web App", "API", "Other / Custom"];
const workTypes = ["Manual Testing", "API Testing", "Regression Testing", "Smoke Testing", "Bug Retest", "Test Case Writing", "Test Report", "Release Testing", "Production Verification", "UAT Support", "Automation Testing", "RnD", "Other / Custom"];
const skills = ["Manual QA", "API Testing", "Regression", "Smoke Testing", "Automation", "SQL/Database", "Mobile App Testing", "Web Testing", "Production Verification", "Test Case Writing", "RnD", "Other / Custom"];
const statuses = ["Not Started", "In Progress", "Blocked", "Waiting for Dev", "Waiting for Requirement", "Ready for Retest", "Retesting", "On Hold", "Done"];
const priorities: Task["priority"][] = ["Critical", "High", "Medium", "Low"];
const unavailableTypes = ["Leave", "Half Day", "Meeting", "Training", "Public Holiday", "Company Holiday", "Release Call", "Other"];

const initialMembers: Member[] = [
  { id: "nahid", name: "Nahid", role: "QA Lead", dailyCapacity: 6, skills: ["Manual QA", "API Testing", "Regression", "SQL/Database"], status: "Active" },
  { id: "sabbir", name: "Sabbir", role: "Mid QA", dailyCapacity: 6, skills: ["Manual QA", "API Testing", "Regression", "Smoke Testing"], status: "Active" },
  { id: "jyoti", name: "Jyoti", role: "Junior QA", dailyCapacity: 6, skills: ["Manual QA", "Regression", "Web Testing", "Test Case Writing"], status: "Active" },
  { id: "safin", name: "Safin", role: "Intern", dailyCapacity: 6, skills: ["Smoke Testing", "Manual QA", "Test Case Writing"], status: "Active" },
];

function todayString() {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  return date.toISOString().slice(0, 10);
}

function addDays(dateString: string, days: number) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysBetween(start: string, end: string) {
  const startDate = new Date(`${start}T12:00:00`).getTime();
  const endDate = new Date(`${end}T12:00:00`).getTime();
  return Math.round((endDate - startDate) / 86400000);
}

function labelDate(dateString: string) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
}

function isFriday(dateString: string) {
  return new Date(`${dateString}T12:00:00`).getDay() === 5;
}

function statusColor(status: string) {
  if (status === "Done") return "bg-emerald-100 text-emerald-800";
  if (status.includes("Blocked") || status.includes("Waiting")) return "bg-amber-100 text-amber-800";
  if (status === "In Progress" || status === "Retesting") return "bg-blue-100 text-blue-800";
  return "bg-slate-100 text-slate-700";
}

function priorityColor(priority: Task["priority"]) {
  if (priority === "Critical") return "bg-red-100 text-red-800";
  if (priority === "High") return "bg-orange-100 text-orange-800";
  if (priority === "Medium") return "bg-yellow-100 text-yellow-800";
  return "bg-green-100 text-green-800";
}

function utilizationLabel(value: number) {
  if (value > 100) return "Over Capacity";
  if (value >= 81) return "Highly Allocated";
  if (value >= 51) return "Moderately Allocated";
  return "Available Capacity";
}

function heatColor(value: number, capacity: number) {
  if (capacity <= 0 && value > 0) return "bg-red-200 text-red-950 border-red-300";
  if (capacity <= 0) return "bg-slate-100 text-slate-500 border-slate-200";
  if (value > 100) return "bg-red-200 text-red-950 border-red-300";
  if (value >= 81) return "bg-orange-200 text-orange-950 border-orange-300";
  if (value >= 51) return "bg-yellow-100 text-yellow-900 border-yellow-200";
  return "bg-emerald-100 text-emerald-900 border-emerald-200";
}

const seedTasks: Task[] = [
  { id: "T-001", name: "Payroll salary structure regression", module: "Payroll", workType: "Regression Testing", requiredSkill: "Regression", assignedTo: "nahid", priority: "High", status: "In Progress", startDate: todayString(), dueDate: addDays(todayString(), 1), estimatedHours: 10, blocked: false, blockerType: "", blockerNote: "", blockedSince: "", notes: "Initial sample task" },
  { id: "T-002", name: "Leave API smoke test", module: "Leave", workType: "API Testing", requiredSkill: "API Testing", assignedTo: "sabbir", priority: "Medium", status: "Not Started", startDate: todayString(), dueDate: addDays(todayString(), 3), estimatedHours: 8, blocked: false, blockerType: "", blockerNote: "", blockedSince: "", notes: "" },
  { id: "T-003", name: "Attendance report retest", module: "Attendance", workType: "Bug Retest", requiredSkill: "Manual QA", assignedTo: "jyoti", priority: "Medium", status: "Blocked", startDate: addDays(todayString(), -1), dueDate: addDays(todayString(), 2), estimatedHours: 6, blocked: true, blockerType: "Dev", blockerNote: "Waiting for latest fix", blockedSince: todayString(), notes: "" },
  { id: "T-004", name: "Mobile app smoke checklist", module: "Mobile App", workType: "Smoke Testing", requiredSkill: "Smoke Testing", assignedTo: "safin", priority: "Low", status: "In Progress", startDate: todayString(), dueDate: addDays(todayString(), 5), estimatedHours: 8, blocked: false, blockerType: "", blockerNote: "", blockedSince: "", notes: "" },
];

const seedAllocations: Allocation[] = [
  { id: "A-001", date: todayString(), memberId: "nahid", taskId: "T-001", plannedHours: 4, actualHours: undefined, note: "Plan" },
  { id: "A-002", date: todayString(), memberId: "sabbir", taskId: "T-002", plannedHours: 3, actualHours: undefined, note: "Plan" },
  { id: "A-003", date: todayString(), memberId: "jyoti", taskId: "T-003", plannedHours: 2, actualHours: undefined, note: "Blocked follow-up" },
  { id: "A-004", date: todayString(), memberId: "safin", taskId: "T-004", plannedHours: 3, actualHours: undefined, note: "Plan" },
];

function useLocalState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(key);
    if (saved) setValue(JSON.parse(saved) as T);
    setReady(true);
  }, [key]);

  useEffect(() => {
    if (ready) window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, ready, value]);

  return [value, setValue] as const;
}

export default function Home() {
  const [members, setMembers] = useLocalState<Member[]>("qa-members", initialMembers);
  const [tasks, setTasks] = useLocalState<Task[]>("qa-tasks", seedTasks);
  const [allocations, setAllocations] = useLocalState<Allocation[]>("qa-allocations", seedAllocations);
  const [unavailable, setUnavailable] = useLocalState<Unavailable[]>("qa-unavailable", [
    { id: "U-001", date: addDays(todayString(), 2), memberId: "all", type: "Public Holiday", hours: 6, reason: "Sample public holiday" },
  ]);

  const [tab, setTab] = useState("Dashboard");
  const [startDate, setStartDate] = useState(todayString());
  const [days, setDays] = useState(7);
  const [taskDraft, setTaskDraft] = useState<Task>({ id: "", name: "", module: "HRIS", workType: "Manual Testing", requiredSkill: "Manual QA", assignedTo: "nahid", priority: "Medium", status: "Not Started", startDate: todayString(), dueDate: addDays(todayString(), 2), estimatedHours: 4, adjustedRemaining: undefined, blocked: false, blockerType: "", blockerNote: "", blockedSince: "", notes: "" });
  const [allocationDraft, setAllocationDraft] = useState<Allocation>({ id: "", date: todayString(), memberId: "nahid", taskId: "T-001", plannedHours: 1, actualHours: undefined, note: "" });
  const [unavailableDraft, setUnavailableDraft] = useState<Unavailable>({ id: "", date: todayString(), memberId: "all", type: "Public Holiday", hours: 6, reason: "" });
  const [memberDraft, setMemberDraft] = useState<Member>({ id: "", name: "", role: "QA", dailyCapacity: 6, skills: ["Manual QA"], status: "Active" });
  const [urgent, setUrgent] = useState<UrgentInput>({ name: "Urgent release retest", workType: "Bug Retest", requiredSkill: "Manual QA", estimatedHours: 6, deadline: addDays(todayString(), 1), priority: "Critical", preferredMemberId: "" });

  const activeMembers = members.filter((member) => member.status === "Active");
  const dateRange = useMemo(() => Array.from({ length: days }, (_, index) => addDays(startDate, index)), [days, startDate]);

  const memberName = (id: string) => members.find((member) => member.id === id)?.name ?? id;
  const taskName = (id: string) => tasks.find((task) => task.id === id)?.name ?? id;

  const plannedFor = (memberId: string, date: string) => allocations.filter((item) => item.memberId === memberId && item.date === date).reduce((sum, item) => sum + Number(item.plannedHours || 0), 0);
  const actualFor = (memberId: string, date: string) => allocations.filter((item) => item.memberId === memberId && item.date === date).reduce((sum, item) => sum + Number(item.actualHours || 0), 0);
  const taskActual = (taskId: string) => allocations.filter((item) => item.taskId === taskId).reduce((sum, item) => sum + Number(item.actualHours || 0), 0);

  const unavailableHours = (memberId: string, date: string) => unavailable
    .filter((item) => item.date === date && (item.memberId === memberId || item.memberId === "all"))
    .reduce((sum, item) => sum + Number(item.hours || 0), 0);

  const capacityFor = (member: Member, date: string) => {
    const base = isFriday(date) ? 0 : member.dailyCapacity;
    return Math.max(0, base - unavailableHours(member.id, date));
  };

  const utilizationFor = (member: Member, date: string) => {
    const capacity = capacityFor(member, date);
    const planned = plannedFor(member.id, date);
    if (capacity === 0) return planned > 0 ? 150 : 0;
    return Math.round((planned / capacity) * 100);
  };

  const remainingFor = (task: Task) => {
    const auto = Math.max(0, task.estimatedHours - taskActual(task.id));
    return typeof task.adjustedRemaining === "number" && !Number.isNaN(task.adjustedRemaining) ? task.adjustedRemaining : auto;
  };

  const deadlineRisk = (task: Task) => {
    if (task.status === "Done") return "Completed";
    if (!task.dueDate) return "No Due Date";
    const diff = daysBetween(todayString(), task.dueDate);
    if (diff < 0) return "Overdue";
    if (diff === 0) return "Due Today";
    if (diff === 1) return "Due Tomorrow";
    if (diff <= 2 && remainingFor(task) > 4) return "At Risk";
    return "Safe";
  };

  const memberWeekly = activeMembers.map((member) => {
    const capacity = dateRange.reduce((sum, date) => sum + capacityFor(member, date), 0);
    const planned = dateRange.reduce((sum, date) => sum + plannedFor(member.id, date), 0);
    const actual = dateRange.reduce((sum, date) => sum + actualFor(member.id, date), 0);
    return { member, capacity, planned, actual, available: capacity - planned, utilization: capacity ? Math.round((planned / capacity) * 100) : planned > 0 ? 150 : 0 };
  });

  const summary = {
    activeTasks: tasks.filter((task) => task.status !== "Done").length,
    overCapacity: memberWeekly.filter((item) => item.utilization > 100).length,
    availableMembers: memberWeekly.filter((item) => item.available > 0).length,
    blockedTasks: tasks.filter((task) => task.blocked || task.status === "Blocked").length,
    dueSoon: tasks.filter((task) => ["Due Today", "Due Tomorrow"].includes(deadlineRisk(task))).length,
    overdue: tasks.filter((task) => deadlineRisk(task) === "Overdue").length,
  };

  const rankedAvailability = activeMembers.map((member) => {
    const next3 = dateRange.slice(0, 3).reduce((sum, date) => sum + (capacityFor(member, date) - plannedFor(member.id, date)), 0);
    const nextAll = dateRange.reduce((sum, date) => sum + (capacityFor(member, date) - plannedFor(member.id, date)), 0);
    return { member, next3, nextAll, skills: member.skills.slice(0, 3).join(", ") };
  }).sort((a, b) => b.next3 - a.next3);

  const urgentPlan = useMemo(() => {
    const deadlineWindow = Math.max(1, Math.min(7, daysBetween(todayString(), urgent.deadline) + 1));
    const windowDates = Array.from({ length: deadlineWindow }, (_, index) => addDays(todayString(), index));
    const scored = activeMembers.map((member) => {
      const available = windowDates.reduce((sum, date) => sum + Math.max(0, capacityFor(member, date) - plannedFor(member.id, date)), 0);
      const skillMatch = member.skills.includes(urgent.requiredSkill) ? 1 : 0;
      const preferred = urgent.preferredMemberId === member.id ? 1 : 0;
      return { member, available, skillMatch, preferred, score: available + skillMatch * 6 + preferred * 4 };
    }).sort((a, b) => b.score - a.score);
    const best = scored[0];
    const backup = scored[1];
    const risk = !best ? "No member" : best.available >= urgent.estimatedHours ? "Manageable" : best.available >= urgent.estimatedHours / 2 ? "Tight" : "Risky";
    const shifts = best ? tasks.filter((task) => task.assignedTo === best.member.id && task.status !== "Done" && ["Medium", "Low"].includes(task.priority) && task.dueDate >= urgent.deadline).slice(0, 3) : [];
    return { best, backup, risk, shifts, windowDates };
  }, [activeMembers, allocations, members, tasks, unavailable, urgent]);

  function addTask() {
    if (!taskDraft.name.trim()) return;
    const nextNumber = String(tasks.length + 1).padStart(3, "0");
    const newTask = { ...taskDraft, id: taskDraft.id.trim() || `T-${nextNumber}`, name: taskDraft.name.trim(), blocked: taskDraft.status === "Blocked" || taskDraft.blocked };
    setTasks([newTask, ...tasks]);
    setTaskDraft({ ...taskDraft, id: "", name: "", notes: "", status: "Not Started", estimatedHours: 4, adjustedRemaining: undefined, blocked: false, blockerType: "", blockerNote: "", blockedSince: "" });
  }

  function addAllocation() {
    if (!allocationDraft.taskId || !allocationDraft.memberId) return;
    setAllocations([{ ...allocationDraft, id: uid("A") }, ...allocations]);
    setAllocationDraft({ ...allocationDraft, plannedHours: 1, actualHours: undefined, note: "" });
  }

  function addUnavailable() {
    setUnavailable([{ ...unavailableDraft, id: uid("U") }, ...unavailable]);
    setUnavailableDraft({ ...unavailableDraft, reason: "" });
  }

  function addMember() {
    if (!memberDraft.name.trim()) return;
    const id = memberDraft.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || uid("M");
    setMembers([{ ...memberDraft, id }, ...members]);
    setMemberDraft({ id: "", name: "", role: "QA", dailyCapacity: 6, skills: ["Manual QA"], status: "Active" });
  }

  const inputClass = "w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring-4";
  const buttonClass = "rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800";
  const subtleButtonClass = "rounded-xl border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50";

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-[2rem] bg-gradient-to-br from-emerald-900 via-emerald-800 to-lime-700 p-6 text-white card-shadow sm:p-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-100">Internal QA Planning Tool</p>
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-3xl font-bold sm:text-5xl">QA Workload Tracker</h1>
              <p className="mt-3 max-w-2xl text-emerald-50">Track task ownership, daily plan vs actual, availability, blocked work, deadline risk, and urgent task impact in one place.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-2xl bg-white/15 p-3 backdrop-blur"><strong>{activeMembers.length}</strong><br />Active QA</div>
              <div className="rounded-2xl bg-white/15 p-3 backdrop-blur"><strong>6 hrs</strong><br />Default capacity</div>
              <div className="rounded-2xl bg-white/15 p-3 backdrop-blur"><strong>Friday</strong><br />Weekend</div>
            </div>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {["Dashboard", "Tasks", "Daily Allocation", "Availability", "Urgent Planner", "Team"].map((item) => (
            <button key={item} onClick={() => setTab(item)} className={tab === item ? buttonClass : subtleButtonClass}>{item}</button>
          ))}
        </div>

        {tab === "Dashboard" && (
          <div className="space-y-5">
            <div className="rounded-3xl bg-white p-4 card-shadow">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Dashboard controls</h2>
                  <p className="text-sm text-slate-500">Default view starts from today. You can change range for planning.</p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:w-96">
                  <label className="text-sm font-medium text-slate-700">Start date<input type="date" className={inputClass} value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
                  <label className="text-sm font-medium text-slate-700">Days<select className={inputClass} value={days} onChange={(event) => setDays(Number(event.target.value))}><option value={3}>3</option><option value={7}>7</option><option value={14}>14</option></select></label>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              {[
                ["Active Tasks", summary.activeTasks], ["Over Capacity", summary.overCapacity], ["Available Members", summary.availableMembers], ["Blocked Tasks", summary.blockedTasks], ["Due Today/Tomorrow", summary.dueSoon], ["Overdue", summary.overdue]
              ].map(([label, value]) => <div key={label} className="rounded-3xl bg-white p-5 card-shadow"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-emerald-800">{value}</p></div>)}
            </div>

            <Card title="Next planning window availability heatmap" subtitle="Capacity uses 6 hrs/day and Friday as weekend. Public holiday/unavailable rows reduce capacity.">
              <div className="table-scroll">
                <table className="w-full min-w-[850px] border-separate border-spacing-2 text-sm">
                  <thead><tr><th className="text-left">Member</th>{dateRange.map((date) => <th key={date} className="text-center">{labelDate(date)}<br /><span className="text-xs font-normal text-slate-400">{isFriday(date) ? "Weekend" : "Workday"}</span></th>)}</tr></thead>
                  <tbody>
                    {activeMembers.map((member) => <tr key={member.id}><td className="font-semibold text-slate-800">{member.name}<br /><span className="text-xs font-normal text-slate-500">{member.role}</span></td>{dateRange.map((date) => {
                      const util = utilizationFor(member, date); const capacity = capacityFor(member, date);
                      return <td key={date} className={`rounded-2xl border p-3 text-center ${heatColor(util, capacity)}`}><strong>{util}%</strong><br /><span className="text-xs">{utilizationLabel(util)}</span><br /><span className="text-xs">{plannedFor(member.id, date)}/{capacity} hrs</span></td>;
                    })}</tr>)}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="grid gap-5 lg:grid-cols-2">
              <Card title="Member-wise workload summary" subtitle="Planned vs actual for selected range.">
                <SimpleTable headers={["Member", "Capacity", "Planned", "Actual", "Available", "Utilization"]} rows={memberWeekly.map((item) => [item.member.name, `${item.capacity}h`, `${item.planned}h`, `${item.actual}h`, `${item.available}h`, `${item.utilization}%`])} />
              </Card>
              <Card title="Who can take new work?" subtitle="Ranked by next 3 days available hours.">
                <SimpleTable headers={["Rank", "Member", "Next 3 Days", `Next ${days} Days`, "Suitable For"]} rows={rankedAvailability.map((item, index) => [String(index + 1), item.member.name, `${item.next3}h`, `${item.nextAll}h`, item.skills])} />
              </Card>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <Card title="Urgent task impact summary" subtitle="Formula-only suggestion. It does not auto-change existing allocation.">
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <Metric label="Best suggested QA" value={urgentPlan.best?.member.name ?? "N/A"} />
                  <Metric label="Backup QA" value={urgentPlan.backup?.member.name ?? "N/A"} />
                  <Metric label="Risk" value={urgentPlan.risk} />
                  <Metric label="Available hours" value={`${urgentPlan.best?.available ?? 0}h before deadline`} />
                </div>
                <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
                  Suggested shift candidates: {urgentPlan.shifts.length ? urgentPlan.shifts.map((task) => task.name).join(", ") : "No clear medium/low priority shift candidate found."}
                </div>
              </Card>
              <Card title="Plan vs actual variance" subtitle="Actual blank is treated as Not Updated.">
                <SimpleTable headers={["Member", "Planned", "Actual", "Variance", "Label"]} rows={memberWeekly.map((item) => {
                  const variance = item.actual - item.planned;
                  const label = item.actual === 0 ? "Not Updated" : variance === 0 ? "On Track" : variance > 0 ? "Over Planned" : "Under Planned";
                  return [item.member.name, `${item.planned}h`, `${item.actual}h`, `${variance}h`, label];
                })} />
              </Card>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <Card title="Risky / deadline tasks" subtitle="Completed tasks are ignored from risk.">
                <SimpleTable headers={["Task", "Assigned", "Due", "Risk"]} rows={tasks.filter((task) => !["Safe", "Completed"].includes(deadlineRisk(task))).map((task) => [task.name, memberName(task.assignedTo), task.dueDate || "-", deadlineRisk(task)]).slice(0, 8)} empty="No risky tasks." />
              </Card>
              <Card title="Blocked task tracker" subtitle="For escalation to dev, requirement, environment, access, or data owner.">
                <SimpleTable headers={["Task", "Assigned", "Type", "Days", "Note"]} rows={tasks.filter((task) => task.blocked || task.status === "Blocked").map((task) => [task.name, memberName(task.assignedTo), task.blockerType || "-", task.blockedSince ? String(Math.max(0, daysBetween(task.blockedSince, todayString()))) : "-", task.blockerNote || "-"])} empty="No blocked tasks." />
              </Card>
            </div>
          </div>
        )}

        {tab === "Tasks" && (
          <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
            <Card title="Add task" subtitle="Lead can create work items here.">
              <div className="space-y-3">
                <input className={inputClass} placeholder="Task name" value={taskDraft.name} onChange={(event) => setTaskDraft({ ...taskDraft, name: event.target.value })} />
                <div className="grid grid-cols-2 gap-3"><Select label="Module" value={taskDraft.module} options={modules} onChange={(value) => setTaskDraft({ ...taskDraft, module: value })} /><Select label="Work type" value={taskDraft.workType} options={workTypes} onChange={(value) => setTaskDraft({ ...taskDraft, workType: value })} /></div>
                <div className="grid grid-cols-2 gap-3"><Select label="Skill" value={taskDraft.requiredSkill} options={skills} onChange={(value) => setTaskDraft({ ...taskDraft, requiredSkill: value })} /><Select label="Assigned QA" value={taskDraft.assignedTo} options={activeMembers.map((m) => m.id)} optionLabel={memberName} onChange={(value) => setTaskDraft({ ...taskDraft, assignedTo: value })} /></div>
                <div className="grid grid-cols-2 gap-3"><Select label="Priority" value={taskDraft.priority} options={priorities} onChange={(value) => setTaskDraft({ ...taskDraft, priority: value as Task["priority"] })} /><Select label="Status" value={taskDraft.status} options={statuses} onChange={(value) => setTaskDraft({ ...taskDraft, status: value, blocked: value === "Blocked" ? true : taskDraft.blocked })} /></div>
                <div className="grid grid-cols-2 gap-3"><label className="text-sm font-medium">Start date<input type="date" className={inputClass} value={taskDraft.startDate} onChange={(event) => setTaskDraft({ ...taskDraft, startDate: event.target.value })} /></label><label className="text-sm font-medium">Due date<input type="date" className={inputClass} value={taskDraft.dueDate} onChange={(event) => setTaskDraft({ ...taskDraft, dueDate: event.target.value })} /></label></div>
                <label className="text-sm font-medium">Estimated hours<input type="number" min={0} className={inputClass} value={taskDraft.estimatedHours} onChange={(event) => setTaskDraft({ ...taskDraft, estimatedHours: Number(event.target.value) })} /></label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={taskDraft.blocked} onChange={(event) => setTaskDraft({ ...taskDraft, blocked: event.target.checked })} /> Blocked?</label>
                {taskDraft.blocked && <div className="space-y-3"><Select label="Blocker type" value={taskDraft.blockerType} options={["Dev", "Requirement", "Environment", "Data", "Access", "Other"]} onChange={(value) => setTaskDraft({ ...taskDraft, blockerType: value })} /><input className={inputClass} placeholder="Blocker note" value={taskDraft.blockerNote} onChange={(event) => setTaskDraft({ ...taskDraft, blockerNote: event.target.value })} /><label className="text-sm font-medium">Blocked since<input type="date" className={inputClass} value={taskDraft.blockedSince} onChange={(event) => setTaskDraft({ ...taskDraft, blockedSince: event.target.value })} /></label></div>}
                <button className={buttonClass} onClick={addTask}>Add task</button>
              </div>
            </Card>
            <Card title="Task list" subtitle="Task status can be edited in code/database in next phase. MVP supports adding and removing sample rows.">
              <div className="table-scroll"><table className="w-full min-w-[980px] text-left text-sm"><thead><tr className="border-b text-slate-500"><th className="py-3">ID</th><th>Task</th><th>Assigned</th><th>Priority</th><th>Status</th><th>Due</th><th>Remaining</th><th>Risk</th><th></th></tr></thead><tbody>{tasks.map((task) => <tr key={task.id} className="border-b border-slate-100"><td className="py-3 font-semibold">{task.id}</td><td>{task.name}<br /><span className="text-xs text-slate-500">{task.module} • {task.workType}</span></td><td>{memberName(task.assignedTo)}</td><td><span className={`rounded-full px-2 py-1 text-xs ${priorityColor(task.priority)}`}>{task.priority}</span></td><td><span className={`rounded-full px-2 py-1 text-xs ${statusColor(task.status)}`}>{task.status}</span></td><td>{task.dueDate}</td><td>{remainingFor(task)}h</td><td>{deadlineRisk(task)}</td><td><button className="text-red-600" onClick={() => setTasks(tasks.filter((item) => item.id !== task.id))}>Remove</button></td></tr>)}</tbody></table></div>
            </Card>
          </div>
        )}

        {tab === "Daily Allocation" && (
          <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
            <Card title="Add daily update" subtitle="Each QA can add planned and actual hours once daily; urgent updates can be added anytime.">
              <div className="space-y-3">
                <label className="text-sm font-medium">Date<input type="date" className={inputClass} value={allocationDraft.date} onChange={(event) => setAllocationDraft({ ...allocationDraft, date: event.target.value })} /></label>
                <Select label="Member" value={allocationDraft.memberId} options={activeMembers.map((m) => m.id)} optionLabel={memberName} onChange={(value) => setAllocationDraft({ ...allocationDraft, memberId: value })} />
                <Select label="Task" value={allocationDraft.taskId} options={tasks.map((task) => task.id)} optionLabel={(id) => `${id} | ${taskName(id)}`} onChange={(value) => setAllocationDraft({ ...allocationDraft, taskId: value })} />
                <div className="grid grid-cols-2 gap-3"><label className="text-sm font-medium">Planned hours<input type="number" min={0} step="0.5" className={inputClass} value={allocationDraft.plannedHours} onChange={(event) => setAllocationDraft({ ...allocationDraft, plannedHours: Number(event.target.value) })} /></label><label className="text-sm font-medium">Actual hours<input type="number" min={0} step="0.5" className={inputClass} value={allocationDraft.actualHours ?? ""} onChange={(event) => setAllocationDraft({ ...allocationDraft, actualHours: event.target.value === "" ? undefined : Number(event.target.value) })} /></label></div>
                <textarea className={inputClass} placeholder="Update note" value={allocationDraft.note} onChange={(event) => setAllocationDraft({ ...allocationDraft, note: event.target.value })} />
                <button className={buttonClass} onClick={addAllocation}>Add update</button>
              </div>
            </Card>
            <Card title="Daily allocation history" subtitle="Latest rows first.">
              <SimpleTable headers={["Date", "Member", "Task", "Planned", "Actual", "Variance", "Note"]} rows={allocations.map((item) => {
                const variance = item.actualHours === undefined ? "Not Updated" : `${item.actualHours - item.plannedHours}h`;
                return [item.date, memberName(item.memberId), taskName(item.taskId), `${item.plannedHours}h`, item.actualHours === undefined ? "-" : `${item.actualHours}h`, variance, item.note || "-"];
              })} />
            </Card>
          </div>
        )}

        {tab === "Availability" && (
          <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
            <Card title="Add unavailable / holiday" subtitle="Use member = All for public/company holiday.">
              <div className="space-y-3">
                <label className="text-sm font-medium">Date<input type="date" className={inputClass} value={unavailableDraft.date} onChange={(event) => setUnavailableDraft({ ...unavailableDraft, date: event.target.value })} /></label>
                <Select label="Member" value={unavailableDraft.memberId} options={["all", ...activeMembers.map((m) => m.id)]} optionLabel={(id) => id === "all" ? "All members" : memberName(id)} onChange={(value) => setUnavailableDraft({ ...unavailableDraft, memberId: value })} />
                <Select label="Type" value={unavailableDraft.type} options={unavailableTypes} onChange={(value) => setUnavailableDraft({ ...unavailableDraft, type: value })} />
                <label className="text-sm font-medium">Unavailable hours<input type="number" min={0} step="0.5" className={inputClass} value={unavailableDraft.hours} onChange={(event) => setUnavailableDraft({ ...unavailableDraft, hours: Number(event.target.value) })} /></label>
                <input className={inputClass} placeholder="Reason / note" value={unavailableDraft.reason} onChange={(event) => setUnavailableDraft({ ...unavailableDraft, reason: event.target.value })} />
                <button className={buttonClass} onClick={addUnavailable}>Add unavailable</button>
              </div>
            </Card>
            <Card title="Unavailable & holiday list" subtitle="This reduces effective capacity automatically.">
              <SimpleTable headers={["Date", "Member", "Type", "Hours", "Reason"]} rows={unavailable.map((item) => [item.date, item.memberId === "all" ? "All members" : memberName(item.memberId), item.type, `${item.hours}h`, item.reason || "-"])} />
            </Card>
          </div>
        )}

        {tab === "Urgent Planner" && (
          <div className="grid gap-5 lg:grid-cols-[380px_1fr]">
            <Card title="Urgent task input" subtitle="This suggests impact. It does not automatically change allocation.">
              <div className="space-y-3">
                <input className={inputClass} value={urgent.name} onChange={(event) => setUrgent({ ...urgent, name: event.target.value })} placeholder="Urgent task name" />
                <div className="grid grid-cols-2 gap-3"><Select label="Work type" value={urgent.workType} options={workTypes} onChange={(value) => setUrgent({ ...urgent, workType: value })} /><Select label="Required skill" value={urgent.requiredSkill} options={skills} onChange={(value) => setUrgent({ ...urgent, requiredSkill: value })} /></div>
                <div className="grid grid-cols-2 gap-3"><label className="text-sm font-medium">Estimated hours<input className={inputClass} type="number" min={1} value={urgent.estimatedHours} onChange={(event) => setUrgent({ ...urgent, estimatedHours: Number(event.target.value) })} /></label><label className="text-sm font-medium">Deadline<input className={inputClass} type="date" value={urgent.deadline} onChange={(event) => setUrgent({ ...urgent, deadline: event.target.value })} /></label></div>
                <Select label="Preferred QA (optional)" value={urgent.preferredMemberId} options={["", ...activeMembers.map((m) => m.id)]} optionLabel={(id) => id ? memberName(id) : "No preference"} onChange={(value) => setUrgent({ ...urgent, preferredMemberId: value })} />
              </div>
            </Card>
            <Card title="Urgent task recommendation" subtitle="Best QA = skill match + available capacity before deadline + optional preference.">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Metric label="Best QA" value={urgentPlan.best?.member.name ?? "N/A"} />
                <Metric label="Backup QA" value={urgentPlan.backup?.member.name ?? "N/A"} />
                <Metric label="Risk" value={urgentPlan.risk} />
                <Metric label="Available before deadline" value={`${urgentPlan.best?.available ?? 0}h`} />
              </div>
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-bold">Suggested daily split</h3><div className="mt-3 space-y-2 text-sm">{urgentPlan.windowDates.map((date) => {
                  const best = urgentPlan.best?.member; if (!best) return null;
                  const available = Math.max(0, capacityFor(best, date) - plannedFor(best.id, date));
                  const perDay = Math.min(available, Math.ceil(urgent.estimatedHours / urgentPlan.windowDates.length));
                  return <div key={date} className="flex justify-between rounded-xl bg-white px-3 py-2"><span>{labelDate(date)}</span><strong>{perDay}h proposed</strong></div>;
                })}</div></div>
                <div className="rounded-2xl bg-amber-50 p-4"><h3 className="font-bold">Shift candidate tasks</h3><div className="mt-3 space-y-2 text-sm">{urgentPlan.shifts.length ? urgentPlan.shifts.map((task) => <div key={task.id} className="rounded-xl bg-white px-3 py-2"><strong>{task.name}</strong><br /><span className="text-slate-500">{task.priority} • Due {task.dueDate}</span></div>) : <p>No medium/low priority task found for shifting.</p>}</div></div>
              </div>
            </Card>
          </div>
        )}

        {tab === "Team" && (
          <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
            <Card title="Add team member" subtitle="For future QA members.">
              <div className="space-y-3"><input className={inputClass} placeholder="Name" value={memberDraft.name} onChange={(event) => setMemberDraft({ ...memberDraft, name: event.target.value })} /><input className={inputClass} placeholder="Role" value={memberDraft.role} onChange={(event) => setMemberDraft({ ...memberDraft, role: event.target.value })} /><label className="text-sm font-medium">Daily capacity<input className={inputClass} type="number" value={memberDraft.dailyCapacity} onChange={(event) => setMemberDraft({ ...memberDraft, dailyCapacity: Number(event.target.value) })} /></label><Select label="Primary skill" value={memberDraft.skills[0]} options={skills} onChange={(value) => setMemberDraft({ ...memberDraft, skills: [value] })} /><button className={buttonClass} onClick={addMember}>Add member</button></div>
            </Card>
            <Card title="Team members" subtitle="Initial QA team loaded from requirement.">
              <SimpleTable headers={["Name", "Role", "Capacity", "Skills", "Status"]} rows={members.map((member) => [member.name, member.role, `${member.dailyCapacity}h/day`, member.skills.join(", "), member.status])} />
            </Card>
          </div>
        )}
      </section>
    </main>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return <section className="rounded-3xl bg-white p-5 card-shadow"><div className="mb-4"><h2 className="text-xl font-bold text-slate-900">{title}</h2>{subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}</div>{children}</section>;
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4"><p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">{label}</p><p className="mt-2 text-xl font-bold text-emerald-950">{value}</p></div>;
}

function Select({ label, value, options, onChange, optionLabel }: { label: string; value: string; options: string[]; onChange: (value: string) => void; optionLabel?: (value: string) => string }) {
  return <label className="text-sm font-medium text-slate-700">{label}<select className="mt-1 w-full rounded-xl border border-emerald-100 bg-white px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring-4" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{optionLabel ? optionLabel(option) : option}</option>)}</select></label>;
}

function SimpleTable({ headers, rows, empty = "No data available." }: { headers: string[]; rows: (string | number)[][]; empty?: string }) {
  return <div className="table-scroll"><table className="w-full min-w-[560px] text-left text-sm"><thead><tr className="border-b text-slate-500">{headers.map((header) => <th key={header} className="py-3 pr-4 font-semibold">{header}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row, index) => <tr key={index} className="border-b border-slate-100">{row.map((cell, cellIndex) => <td key={`${index}-${cellIndex}`} className="py-3 pr-4 text-slate-700">{cell}</td>)}</tr>) : <tr><td className="py-4 text-slate-500" colSpan={headers.length}>{empty}</td></tr>}</tbody></table></div>;
}
