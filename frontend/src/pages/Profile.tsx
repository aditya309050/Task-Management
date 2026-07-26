import React, { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useUpdateProfile, useUploadAvatar } from "../hooks/useAppQueries";
import { User, Mail, Lock, Upload, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const updateProfileMutation = useUpdateProfile();
  const uploadAvatarMutation = useUploadAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isUploading, setIsUploading] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const getAvatarUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const backendHost = import.meta.env.VITE_SERVER_URL || "https://task-management-tyxd.onrender.com";
    return `${backendHost}${url}`;
  };

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password) {
      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
      if (!passwordRegex.test(password)) {
        toast.error("Password must be at least 6 characters and contain one uppercase, one lowercase letter, and one number.");
        return;
      }
    }

    try {
      const payload: any = { name, email };
      if (password) payload.password = password;

      const data = await updateProfileMutation.mutateAsync(payload);
      
      // Update session context
      updateUser({
        name: data.user.name,
        email: data.user.email,
      });

      setPassword("");
      setConfirmPassword("");
      toast.success("Profile information updated!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile settings");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size exceeds the 2MB limit.");
      return;
    }

    // Validate type (Images only)
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are supported.");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    setIsUploading(true);
    try {
      const data = await uploadAvatarMutation.mutateAsync(formData);
      
      // Update session context avatar
      updateUser({ avatarUrl: data.avatarUrl });
      toast.success("Profile avatar updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload avatar image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Profile Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your avatar and personal security options</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Avatar Photo Edit Card */}
        <div className="glass-panel flex flex-col items-center rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900/50 md:col-span-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6 text-center self-start">
            Profile Avatar
          </span>

          <div className="relative group">
            {/* Visual avatar wrapper */}
            <div className="relative h-28 w-28 overflow-hidden rounded-full border border-slate-200 shadow-sm dark:border-slate-800">
              {getAvatarUrl(user?.avatarUrl) ? (
                <img
                  src={getAvatarUrl(user?.avatarUrl)!}
                  alt={user?.name}
                  className="h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-75"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-brand-100 text-3xl font-semibold text-brand-700 dark:bg-brand-950 dark:text-brand-400 transition-opacity duration-300 group-hover:opacity-75">
                  {user ? getInitials(user.name) : <User className="h-8 w-8" />}
                </div>
              )}

              {/* Uploading progress overlay */}
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                </div>
              )}
            </div>
            
            {/* Upload Button overlay */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white shadow-md hover:bg-brand-700 transition"
              title="Upload Avatar"
            >
              <Upload className="h-4 w-4" />
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="mt-6 text-center space-y-1">
            <h4 className="font-semibold text-sm text-slate-900 dark:text-white">{user?.name}</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500">{user?.email}</p>
          </div>
          <p className="mt-4 text-[10px] text-slate-400 text-center leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4 w-full">
            Supports PNG, JPEG, or WEBP up to 2MB. Stored locally on the developer sandbox backend.
          </p>
        </div>

        {/* Personal info fields card */}
        <div className="glass-panel rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900/50 md:col-span-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6 block">
            Personal Information
          </span>

          <form onSubmit={handleUpdateInfo} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Full Name
                </label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-9 text-sm outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Email Address
                </label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-9 text-sm outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Change Password Block (Optional) */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-850 space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Change Password (Leave blank to keep current)
              </span>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    New Password
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 px-9 text-sm outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Confirm Password
                  </label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 px-9 text-sm outline-none focus:border-brand-500 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-brand-700 shadow-md shadow-brand-600/10 transition disabled:opacity-50"
              >
                {updateProfileMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
