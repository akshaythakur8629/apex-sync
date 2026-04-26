"use client";

import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, createContext, useContext } from "react";
import { useQueryClient } from "@tanstack/react-query";

const AuthContext = createContext<{
  user: any;
  isLoading: boolean;
  error: any;
  logout: () => void;
} | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Public routes that don't require authentication
  const isPublicRoute = pathname === "/" || pathname === "/login" || pathname === "/onboard";

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["session"],
    queryFn: () => authApi.getMe(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (!isLoading && error && !isPublicRoute) {
      // Redirect to login if session check fails on protected route
      console.error("Session invalid, redirecting...");
      router.push("/?error=session_expired");
    }
  }, [isLoading, error, isPublicRoute, router]);

  const queryClient = useQueryClient();

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      queryClient.clear();
      router.push("/");
    }
  };

  const value = {
    user: data?.user,
    isLoading,
    error,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
