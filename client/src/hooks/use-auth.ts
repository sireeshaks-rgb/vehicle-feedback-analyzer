import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { AuthRequest } from "@shared/schema";

// Custom helper to get token
export const getAuthToken = () => localStorage.getItem("auth_token");
export const setAuthToken = (token: string) => localStorage.setItem("auth_token", token);
export const removeAuthToken = () => localStorage.removeItem("auth_token");

export function useAuth() {
  const queryClient = useQueryClient();

  // Simulated query just to keep React state aware of auth status
  const { data: isAuthenticated } = useQuery({
    queryKey: ["auth_status"],
    queryFn: () => !!getAuthToken(),
    initialData: !!getAuthToken(),
  });

  const loginMutation = useMutation({
    mutationFn: async (data: AuthRequest) => {
      const validated = api.auth.login.input.parse(data);
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });
      
      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid credentials");
        throw new Error("Login failed");
      }
      
      const result = api.auth.login.responses[200].parse(await res.json());
      setAuthToken(result.token);
      return result;
    },
    onSuccess: () => {
      queryClient.setQueryData(["auth_status"], true);
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
        if (res.status === 400) throw new Error("Validation or user exists error");
        throw new Error("Registration failed");
      }
      
      const result = api.auth.register.responses[201].parse(await res.json());
      setAuthToken(result.token);
      return result;
    },
    onSuccess: () => {
      queryClient.setQueryData(["auth_status"], true);
    }
  });

  const logout = () => {
    removeAuthToken();
    queryClient.setQueryData(["auth_status"], false);
  };

  return {
    isAuthenticated,
    login: loginMutation,
    register: registerMutation,
    logout
  };
}
