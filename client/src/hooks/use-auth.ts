import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { AuthRequest } from "@shared/schema";

// Custom helper to get token
export const getAuthToken = () => localStorage.getItem("auth_token");
export const setAuthToken = (token: string) => localStorage.setItem("auth_token", token);
export const removeAuthToken = () => localStorage.removeItem("auth_token");

export function useAuth() {
  const queryClient = useQueryClient();

  // Real user query
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const token = getAuthToken();
      if (!token) return null;
      const res = await fetch(api.auth.me.path, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) {
        removeAuthToken();
        return null;
      }
      return await res.json();
    },
  });

  const isAuthenticated = !!user;

  const loginMutation = useMutation({
    mutationFn: async (data: AuthRequest) => {
      const validated = api.auth.login.input.parse(data);
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Invalid email or password");
      }

      const result = api.auth.login.responses[200].parse(await res.json());
      setAuthToken(result.token);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: AuthRequest) => {
      const validated = api.auth.register.input.parse(data);
      const res = await fetch(api.auth.register.path, {
        method: api.auth.register.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Registration failed");
      }

      const result = api.auth.register.responses[201].parse(await res.json());
      setAuthToken(result.token);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    }
  });

  const logout = () => {
    removeAuthToken();
    queryClient.setQueryData(["/api/auth/me"], null);
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login: loginMutation,
    register: registerMutation,
    logout
  };
}
