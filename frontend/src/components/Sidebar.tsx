import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useProjects, useCreateProject } from "../hooks/useAppQueries";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  FolderKanban,
  User,
  LogOut,
  Plus,
  ChevronRight,
  Folder,
  Loader2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const { data, isLoading } = useProjects();
  const createProjectMutation = useCreateProject();
  
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");

  const isActive = (path: string) => location.pathname === path;

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      await createProjectMutation.mutateAsync({
        name: newProjectName,
        description: newProjectDesc,
      });
      setNewProjectName("");
      setNewProjectDesc("");
      setShowAddProject(false);
      toast.success("Project created successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create project");
    }
  };

  const mainLinks = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Profile Settings", path: "/profile", icon: User },
  ];

  return (
    <>
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-0 -translate-x-64"
        }`}
      >
        {/* Header Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-2" onClick={onClose}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white shadow-md shadow-brand-500/20">
              <FolderKanban className="h-5 w-5" />
            </div>
            <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-white dark:to-slate-300">
              TaskFlow
            </span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6">
          <div className="space-y-1">
            <span className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Main Menu
            </span>
            {mainLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive(link.path)
                      ? "bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Active Projects List */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Projects
              </span>
              <button
                onClick={() => setShowAddProject(!showAddProject)}
                className="rounded p-0.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                title="Create Project"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Create Project Mini Form */}
            {showAddProject && (
              <form onSubmit={handleCreateProject} className="mt-2 space-y-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/40">
                <input
                  type="text"
                  required
                  placeholder="Project Name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:focus:border-brand-500"
                />
                <textarea
                  placeholder="Description (optional)"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  rows={2}
                  className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:focus:border-brand-500 resize-none"
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowAddProject(false)}
                    className="rounded bg-slate-200 px-2 py-1 text-[10px] font-medium text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createProjectMutation.isPending}
                    className="flex items-center gap-1 rounded bg-brand-600 px-2.5 py-1 text-[10px] font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                  >
                    {createProjectMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                    Create
                  </button>
                </div>
              </form>
            )}

            {/* List Projects */}
            <div className="mt-2 space-y-1">
              {isLoading ? (
                <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading projects...
                </div>
              ) : data?.projects && data.projects.length > 0 ? (
                data.projects.map((proj: any) => (
                  <Link
                    key={proj.id}
                    to={`/projects/${proj.id}`}
                    onClick={onClose}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      isActive(`/projects/${proj.id}`)
                        ? "bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Folder className="h-4.5 w-4.5 flex-shrink-0" />
                      <span className="truncate">{proj.name}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                  </Link>
                ))
              ) : (
                <div className="px-3 py-3 text-xs italic text-slate-400 dark:text-slate-500">
                  No projects yet. Create one!
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Footer profile & logout */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <button
            onClick={() => {
              logout();
              toast.success("Logged out successfully");
            }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/20"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};
