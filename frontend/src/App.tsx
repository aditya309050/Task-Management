import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "react-hot-toast";

// Layout components
import { AuthLayout } from "./components/AuthLayout";
import { DashboardLayout } from "./components/DashboardLayout";

// Page views
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { Dashboard } from "./pages/Dashboard";
import { ProjectDetails } from "./pages/ProjectDetails";
import { Profile } from "./pages/Profile";

// Initialize TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents aggressive background fetches when window gains focus
      retry: 1, // Retries failed fetches once
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            {/* Standard notification feedback toasts config */}
            <Toaster
              position="top-right"
              toastOptions={{
                className: "dark:bg-slate-900 dark:text-white dark:border dark:border-slate-800 text-sm font-medium rounded-xl shadow-md",
                duration: 4000,
              }}
            />
            
            <Routes>
              {/* Public Auth Routes */}
              <Route
                path="/login"
                element={
                  <AuthLayout>
                    <Login />
                  </AuthLayout>
                }
              />
              <Route
                path="/signup"
                element={
                  <AuthLayout>
                    <Signup />
                  </AuthLayout>
                }
              />
              <Route
                path="/forgot-password"
                element={
                  <AuthLayout>
                    <ForgotPassword />
                  </AuthLayout>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <AuthLayout>
                    <ResetPassword />
                  </AuthLayout>
                }
              />

              {/* Protected Workspace Dashboard Routes */}
              <Route path="/" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="projects/:id" element={<ProjectDetails />} />
                <Route path="profile" element={<Profile />} />
              </Route>

              {/* Route Fallback redirection */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
