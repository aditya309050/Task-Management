import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useProject,
  useUpdateProject,
  useDeleteProject,
  useAddProjectMember,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useComments,
  useCreateComment,
  useDeleteComment,
  useProjectActivity,
} from "../hooks/useAppQueries";
import { useAuth } from "../context/AuthContext";
import {
  Plus,
  UserPlus,
  Trash2,
  Calendar,
  AlertCircle,
  MessageSquare,
  Loader2,
  User,
  LayoutGrid,
  List,
  Edit2,
  X,
  XCircle,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";

export const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const queryId = id || "";

  // Query Hooks
  const { data, isLoading, error } = useProject(queryId);
  const { data: activityData } = useProjectActivity(queryId);

  // Project Mutations
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();
  const addMemberMutation = useAddProjectMember();

  // Task Mutations
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  // State Management
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState("MEMBER");

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [taskColumn, setTaskColumn] = useState("TODO");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskPriority, setTaskPriority] = useState("MEDIUM");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");

  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !data || !data.project) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
        <h4 className="font-bold">Project not found</h4>
        <p className="text-sm">This project may have been deleted, or you may not have authorization to view it.</p>
      </div>
    );
  }

  const { project } = data;
  const isCreator = project.ownerId === currentUser?.id;

  // Open Edit settings modal
  const openEditProject = () => {
    setEditName(project.name);
    setEditDesc(project.description || "");
    setIsEditProjectOpen(true);
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProjectMutation.mutateAsync({
        id: queryId,
        data: { name: editName, description: editDesc },
      });
      setIsEditProjectOpen(false);
      toast.success("Project updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update project");
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm("Are you absolutely sure you want to delete this project? All associated tasks will be lost forever.")) return;

    try {
      await deleteProjectMutation.mutateAsync(queryId);
      toast.success("Project deleted successfully");
      navigate("/");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete project");
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMemberMutation.mutateAsync({
        id: queryId,
        email: memberEmail,
        role: memberRole,
      });
      setMemberEmail("");
      setIsAddMemberOpen(false);
      toast.success("Member added to workspace!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add member");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    try {
      await createTaskMutation.mutateAsync({
        title: taskTitle,
        description: taskDesc || null,
        status: taskColumn,
        priority: taskPriority,
        dueDate: taskDueDate ? new Date(taskDueDate).toISOString() : null,
        projectId: queryId,
        assigneeId: taskAssignee || null,
      });
      setTaskTitle("");
      setTaskDesc("");
      setTaskAssignee("");
      setTaskDueDate("");
      setIsAddTaskOpen(false);
      toast.success("Task created!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create task");
    }
  };

  const openAddTask = (statusColumn: string) => {
    setTaskColumn(statusColumn);
    setIsAddTaskOpen(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getAvatarUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const backendHost = import.meta.env.VITE_SERVER_URL || "https://task-management-tyxd.onrender.com";
    return `${backendHost}${url}`;
  };

  const isOverdue = (dateString: string | null, status: string) => {
    if (!dateString || status === "DONE") return false;
    return new Date(dateString) < new Date();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "LOW":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400";
      case "MEDIUM":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-brand-400";
      case "HIGH":
        return "bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400";
      case "URGENT":
        return "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400";
      default:
        return "bg-slate-50 text-slate-700";
    }
  };

  // Group tasks by status for Kanban Board
  const columns = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"];
  const columnLabels: Record<string, string> = {
    TODO: "To Do",
    IN_PROGRESS: "In Progress",
    REVIEW: "In Review",
    DONE: "Completed",
  };

  const tasksByColumn = columns.reduce((acc, col) => {
    acc[col] = project.tasks.filter((t: any) => t.status === col);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-8">
      {/* Workspace Header Panel */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {project.name}
            </h1>
            {isCreator && (
              <button
                onClick={openEditProject}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            )}
          </div>
          {project.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {project.description}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Members Avatars list */}
          <div className="flex items-center -space-x-2">
            {project.members.map((m: any) => (
              <div
                key={m.userId}
                title={`${m.user.name} (${m.role.toLowerCase()})`}
                className="relative inline-block h-8 w-8 rounded-full ring-2 ring-slate-50 dark:ring-slate-950"
              >
                {getAvatarUrl(m.user.avatarUrl) ? (
                  <img
                    src={getAvatarUrl(m.user.avatarUrl)!}
                    alt={m.user.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-400">
                    {getInitials(m.user.name)}
                  </div>
                )}
              </div>
            ))}
            {isCreator && (
              <button
                onClick={() => setIsAddMemberOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-slate-300 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                title="Add Members"
              >
                <UserPlus className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

          {/* Toggle Kanban vs List */}
          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-900">
            <button
              onClick={() => setViewMode("kanban")}
              className={`rounded-md p-1.5 transition-all ${
                viewMode === "kanban"
                  ? "bg-white text-brand-600 shadow-sm dark:bg-slate-800 dark:text-brand-400"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-md p-1.5 transition-all ${
                viewMode === "list"
                  ? "bg-white text-brand-600 shadow-sm dark:bg-slate-800 dark:text-brand-400"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {isCreator && (
            <button
              onClick={handleDeleteProject}
              className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-all"
            >
              <Trash2 className="h-4 w-4" />
              Delete Project
            </button>
          )}
        </div>
      </div>

      {/* Main Board View: Kanban or List */}
      {viewMode === "kanban" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 overflow-x-auto pb-4">
          {columns.map((col) => (
            <div key={col} className="flex flex-col h-[70vh] min-w-[250px] rounded-2xl bg-slate-100/50 p-4 dark:bg-slate-900/30">
              {/* Column Title */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    {columnLabels[col]}
                  </h3>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {tasksByColumn[col].length}
                  </span>
                </div>
                <button
                  onClick={() => openAddTask(col)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Task list container */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {tasksByColumn[col].map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="glass-panel group rounded-xl bg-white p-4 shadow-sm border border-slate-100 dark:border-slate-850 dark:bg-slate-900 hover:shadow-md cursor-pointer hover:border-slate-200 dark:hover:border-slate-800 transition-all"
                  >
                    <h4 className="font-semibold text-sm text-slate-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400 line-clamp-2">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Metadata tags */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Priority */}
                        <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${getPriorityColor(task.priority)}`}>
                          {task.priority.toLowerCase()}
                        </span>
                        
                        {/* Due Date */}
                        {task.dueDate && (
                          <span className={`flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                            isOverdue(task.dueDate, task.status)
                              ? "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 animate-pulse"
                              : "bg-slate-50 text-slate-500 dark:bg-slate-850"
                          }`}>
                            <Calendar className="h-3 w-3" />
                            {formatDate(task.dueDate)}
                          </span>
                        )}
                      </div>

                      {/* Assignee */}
                      {task.assignee ? (
                        <div
                          title={`Assigned to ${task.assignee.name}`}
                          className="h-6 w-6 rounded-full border border-slate-200 dark:border-slate-800"
                        >
                          {getAvatarUrl(task.assignee.avatarUrl) ? (
                            <img
                              src={getAvatarUrl(task.assignee.avatarUrl)!}
                              alt={task.assignee.name}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center rounded-full bg-brand-50 text-[10px] font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-400">
                              {getInitials(task.assignee.name)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-slate-300 text-slate-400 dark:border-slate-800">
                          <User className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {tasksByColumn[col].length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-10 text-center dark:border-slate-800">
                    <p className="text-xs text-slate-400 italic">No tasks here</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List Tabular Layout */
        <div className="glass-panel rounded-2xl bg-white shadow-sm overflow-hidden dark:bg-slate-900/50">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/80">
                <th className="px-6 py-4">Task Title</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Assignee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm dark:divide-slate-800">
              {project.tasks.length > 0 ? (
                project.tasks.map((task: any) => (
                  <tr
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="hover:bg-slate-50/50 cursor-pointer transition-colors dark:hover:bg-slate-800/20"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                      {task.title}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {columnLabels[task.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold uppercase ${getPriorityColor(task.priority)}`}>
                        {task.priority.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {task.dueDate ? (
                        <span className={`flex items-center gap-1 text-xs font-medium ${isOverdue(task.dueDate, task.status) ? "text-red-500 font-bold" : "text-slate-500"}`}>
                          {formatDate(task.dueDate)}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-700">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {task.assignee ? (
                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                          {task.assignee.name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm italic text-slate-400">
                    No tasks found in this project.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Embedded collapsing Activity Timeline for project details */}
      <div className="glass-panel rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900/50 max-w-3xl">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6">
          <TrendingUp className="h-5 w-5" />
          Workspace Activity Timeline
        </div>
        <div className="flow-root max-h-[300px] overflow-y-auto pr-2">
          {activityData?.logs && activityData.logs.length > 0 ? (
            <ul className="-mb-8">
              {activityData.logs.map((log: any, logIdx: number) => (
                <li key={log.id}>
                  <div className="relative pb-6">
                    {logIdx !== activityData.logs.length - 1 ? (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100 dark:bg-slate-850" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex space-x-3 text-xs">
                      <div>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          <User className="h-4 w-4" />
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {log.details}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6 text-sm italic text-slate-400">
              No activity logs recorded.
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Edit Project Settings */}
      {isEditProjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">Edit Project Settings</h3>
              <button onClick={() => setIsEditProjectOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateProject} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Project Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Description</label>
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditProjectOpen(false)}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-250 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateProjectMutation.isPending}
                  className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700"
                >
                  {updateProjectMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Invite Member */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">Invite Workspace Member</h3>
              <button onClick={() => setIsAddMemberOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">User Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="colleague@example.com"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Access Role</label>
                <select
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
                >
                  <option value="MEMBER">Member (Edit/Create tasks)</option>
                  <option value="VIEWER">Viewer (Read-only)</option>
                  <option value="OWNER">Owner (Edit project settings)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-205 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMemberMutation.isPending}
                  className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700"
                >
                  {addMemberMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Create Task */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">Create New Task</h3>
              <button onClick={() => setIsAddTaskOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="Task objective..."
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Description</label>
                <textarea
                  placeholder="Detailed notes (optional)..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Assignee</label>
                  <select
                    value={taskAssignee}
                    onChange={(e) => setTaskAssignee(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-800 dark:bg-slate-950"
                  >
                    <option value="">Unassigned</option>
                    {project.members.map((m: any) => (
                      <option key={m.userId} value={m.userId}>
                        {m.user.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Due Date</label>
                <input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTaskMutation.isPending}
                  className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700"
                >
                  {createTaskMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Task Details Modal (Contains details edit, assignee change, priority change, status change, and COMMENTS Feed) */}
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          project={project}
          getInitials={getInitials}
          getAvatarUrl={getAvatarUrl}
          formatDate={formatDate}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={async (taskId, updatedData) => {
            await updateTaskMutation.mutateAsync({ id: taskId, data: updatedData });
          }}
          onDeleteTask={async (taskId) => {
            if (window.confirm("Are you sure you want to delete this task?")) {
              await deleteTaskMutation.mutateAsync({ id: taskId, projectId: queryId });
              setSelectedTask(null);
              toast.success("Task deleted!");
            }
          }}
        />
      )}
    </div>
  );
};

// SUBCOMPONENT: Task Details Modal (threaded dependencies)
interface TaskDetailsModalProps {
  task: any;
  project: any;
  onClose: () => void;
  getInitials: (name: string) => string;
  getAvatarUrl: (url: string | null) => string | null;
  formatDate: (dateString: string | null) => string;
  onUpdateTask: (taskId: string, updatedData: any) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  task: initialTask,
  project,
  onClose,
  getInitials,
  getAvatarUrl,
  formatDate,
  onUpdateTask,
  onDeleteTask,
}) => {
  const { user: currentUser } = useAuth();
  
  // Real-time task fields synchronizer (updates dropdowns instantly)
  const [task, setTask] = useState(initialTask);
  const [isEditingTitleDesc, setIsEditingTitleDesc] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [desc, setDesc] = useState(task.description || "");

  const [newComment, setNewComment] = useState("");

  // Query / Mutation bindings for Comments
  const { data: commentData, isLoading: commentsLoading } = useComments(task.id);
  const createCommentMutation = useCreateComment();
  const deleteCommentMutation = useDeleteComment();

  const handleFieldChange = async (fieldName: string, value: any) => {
    try {
      const updatedFields = { [fieldName]: value === "" ? null : value };
      await onUpdateTask(task.id, updatedFields);
      setTask((prev: any) => ({ ...prev, ...updatedFields }));
      toast.success("Task updated!");
    } catch (err: any) {
      toast.error("Failed to update task parameter");
    }
  };

  const handleSaveTitleDesc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await onUpdateTask(task.id, { title, description: desc || null });
      setTask((prev: any) => ({ ...prev, title, description: desc }));
      setIsEditingTitleDesc(false);
      toast.success("Task updated!");
    } catch (err) {
      toast.error("Failed to update title/description");
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await createCommentMutation.mutateAsync({ taskId: task.id, content: newComment });
      setNewComment("");
      toast.success("Comment added!");
    } catch (err) {
      toast.error("Failed to post comment");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteCommentMutation.mutateAsync({ id: commentId, taskId: task.id });
      toast.success("Comment deleted");
    } catch (err) {
      toast.error("Failed to delete comment");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-400">Task Details</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDeleteTask(task.id)}
              className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
              title="Delete Task"
            >
              <Trash2 className="h-4.5 w-4.5" />
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Task Attributes Panel */}
        <div className="grid gap-6 mt-6 md:grid-cols-3">
          {/* Main info panel */}
          <div className="md:col-span-2 space-y-6 border-r border-slate-100 dark:border-slate-800 pr-4">
            
            {isEditingTitleDesc ? (
              <form onSubmit={handleSaveTitleDesc} className="space-y-3">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold outline-none dark:border-slate-800 dark:bg-slate-950"
                />
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-950 resize-none"
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setTitle(task.title);
                      setDesc(task.description || "");
                      setIsEditingTitleDesc(false);
                    }}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-350"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
                    {task.title}
                  </h2>
                  <button
                    onClick={() => setIsEditingTitleDesc(true)}
                    className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {task.description ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
                    {task.description}
                  </p>
                ) : (
                  <p className="text-xs text-slate-400 italic">No description provided</p>
                )}
              </div>
            )}

            {/* Comments Thread Section */}
            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4" />
                Comments
              </h3>

              {/* List Comments */}
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {commentsLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  </div>
                ) : commentData?.comments && commentData.comments.length > 0 ? (
                  commentData.comments.map((comm: any) => (
                    <div key={comm.id} className="group flex items-start gap-2.5 rounded-lg bg-slate-50 p-2.5 dark:bg-slate-850">
                      {getAvatarUrl(comm.user.avatarUrl) ? (
                        <img
                          src={getAvatarUrl(comm.user.avatarUrl)!}
                          alt={comm.user.name}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-400">
                          {getInitials(comm.user.name)}
                        </div>
                      )}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-355">
                            {comm.user.name}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400">
                              {formatDate(comm.createdAt)}
                            </span>
                            {(comm.userId === currentUser?.id || project.ownerId === currentUser?.id) && (
                              <button
                                onClick={() => handleDeleteComment(comm.id)}
                                className="opacity-0 group-hover:opacity-100 rounded text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700 p-0.5"
                                title="Delete Comment"
                              >
                                <XCircle className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                          {comm.content}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic text-center py-4">No comments posted yet</p>
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handlePostComment} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Post a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950"
                />
                <button
                  type="submit"
                  disabled={createCommentMutation.isPending}
                  className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 transition"
                >
                  Send
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar parameters panel */}
          <div className="space-y-4">
            {/* Status Parameter */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Status</label>
              <select
                value={task.status}
                onChange={(e) => handleFieldChange("status", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none dark:border-slate-850 dark:bg-slate-950 font-semibold"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">In Review</option>
                <option value="DONE">Completed</option>
              </select>
            </div>

            {/* Priority Parameter */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Priority</label>
              <select
                value={task.priority}
                onChange={(e) => handleFieldChange("priority", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none dark:border-slate-850 dark:bg-slate-950 font-semibold"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            {/* Assignee Parameter */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Assignee</label>
              <select
                value={task.assigneeId || ""}
                onChange={(e) => handleFieldChange("assigneeId", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs outline-none dark:border-slate-850 dark:bg-slate-950 font-semibold"
              >
                <option value="">Unassigned</option>
                {project.members.map((m: any) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date Parameter */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Due Date</label>
              <input
                type="date"
                value={task.dueDate ? task.dueDate.split("T")[0] : ""}
                onChange={(e) => handleFieldChange("dueDate", e.target.value ? new Date(e.target.value).toISOString() : null)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none dark:border-slate-850 dark:bg-slate-950 font-semibold"
              />
            </div>
            
            {/* Urgency warning banner */}
            {task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE" && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-red-700 dark:bg-red-950/20 dark:text-red-400">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-[10px] font-semibold">Overdue: This task requires immediate attention!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
