import React from "react";
import { useDashboardStats } from "../hooks/useAppQueries";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderOpen,
  Calendar,
  User,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

export const Dashboard: React.FC = () => {
  const { data, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
        <h4 className="font-bold">Error loading dashboard</h4>
        <p className="text-sm">We couldn't retrieve your workspace metrics. Please try reloading.</p>
      </div>
    );
  }

  const { totalProjects, taskStats, priorityStats, overdueCount, projectProgress, recentActivity } = data;

  // Formatting data for Charts
  const statusChartData = [
    { name: "To Do", value: taskStats.TODO, color: "#94a3b8" }, // slate-400
    { name: "In Progress", value: taskStats.IN_PROGRESS, color: "#3b82f6" }, // blue-500
    { name: "In Review", value: taskStats.REVIEW, color: "#eab308" }, // yellow-500
    { name: "Completed", value: taskStats.DONE, color: "#10b981" }, // emerald-500
  ].filter(item => item.value > 0);

  const priorityChartData = [
    { name: "Low", value: priorityStats.LOW, fill: "#10b981" },
    { name: "Medium", value: priorityStats.MEDIUM, fill: "#3b82f6" },
    { name: "High", value: priorityStats.HIGH, fill: "#f97316" },
    { name: "Urgent", value: priorityStats.URGENT, fill: "#ef4444" },
  ];

  const cards = [
    {
      title: "Active Projects",
      value: totalProjects,
      icon: FolderKanban,
      colorClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      title: "Total Tasks",
      value: taskStats.total,
      icon: FolderOpen,
      colorClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      title: "Completed Tasks",
      value: taskStats.DONE,
      icon: CheckCircle2,
      colorClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Overdue Tasks",
      value: overdueCount,
      icon: AlertTriangle,
      colorClass: overdueCount > 0 ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Workspace Overview</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Your visual dashboard metrics and project progress</p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="glass-panel flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900/50 hover:scale-[1.02] transition-all"
            >
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {card.title}
                </span>
                <h3 className="text-3xl font-bold leading-none text-slate-900 dark:text-white">{card.value}</h3>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.colorClass}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Task Status Distribution */}
        <div className="glass-panel rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900/50">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">
            Tasks by Status
          </h3>
          <div className="h-72">
            {statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(30, 41, 59, 0.9)",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm italic text-slate-400">
                No active tasks to compile data.
              </div>
            )}
          </div>
        </div>

        {/* Task Priority Distribution */}
        <div className="glass-panel rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900/50">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">
            Tasks by Priority
          </h3>
          <div className="h-72">
            {taskStats.total > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityChartData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
                    contentStyle={{
                      backgroundColor: "rgba(30, 41, 59, 0.9)",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {priorityChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm italic text-slate-400">
                No active tasks to compile data.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Projects and Activity Timelines Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Projects Completion Progress */}
        <div className="glass-panel rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900/50 lg:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
            Active Projects Tracker
          </h3>
          <div className="overflow-hidden">
            {projectProgress.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {projectProgress.map((proj: any) => (
                  <div key={proj.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <Link
                        to={`/projects/${proj.id}`}
                        className="font-semibold text-slate-900 hover:text-brand-600 dark:text-white dark:hover:text-brand-400"
                      >
                        {proj.name}
                      </Link>
                      <span className="text-xs text-slate-400">
                        {proj.completedTasks}/{proj.totalTasks} Tasks ({proj.progressPercentage}%)
                      </span>
                    </div>
                    {/* Progress slider bar */}
                    <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all duration-500"
                        style={{ width: `${proj.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm italic text-slate-400">
                You are not added to any projects.
              </div>
            )}
          </div>
        </div>

        {/* Global Recent Activity Log */}
        <div className="glass-panel rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900/50">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
            Recent Activity
          </h3>
          <div className="flow-root">
            {recentActivity.length > 0 ? (
              <ul className="-mb-8">
                {recentActivity.map((log: any, logIdx: number) => (
                  <li key={log.id}>
                    <div className="relative pb-8">
                      {logIdx !== recentActivity.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100 dark:bg-slate-850"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        {/* Circle Icon */}
                        <div>
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600 ring-8 ring-white dark:bg-brand-950 dark:text-brand-400 dark:ring-slate-900">
                            <Clock className="h-4 w-4" />
                          </span>
                        </div>
                        {/* Event details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {log.details}
                          </p>
                          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
                            <User className="h-3 w-3" />
                            <span>{log.user.name}</span>
                            <span>•</span>
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(log.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-8 text-center text-sm italic text-slate-400">
                No recent timeline activities.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
