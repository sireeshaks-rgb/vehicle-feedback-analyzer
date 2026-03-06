import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(api.feedback.submit.path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analytics-summary"] });
      queryClient.invalidateQueries({ queryKey: ["transport-analytics"] });
    }
  });
}

export function useUploadFeedback() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(api.feedback.upload.path, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload feedback");
      }

      return response.json();
    },
  });
}

export function useCohortAnalytics() {
  return useQuery({
    queryKey: ["cohort-analytics"],
    queryFn: async () => {
      const response = await fetch(api.analytics.cohorts.path, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch cohort analytics");
      return response.json();
    }
  });
}

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ["analytics-summary"],
    queryFn: async () => {
      const response = await fetch(api.analytics.summary.path, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch summary");
      return response.json();
    }
  });
}

export function useTransportAnalytics(mode: string) {
  return useQuery({
    queryKey: ["transport-analytics", mode],
    queryFn: async () => {
      const path = api.analytics.transport.path.replace(":mode", mode);
      const response = await fetch(path, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch transport analytics");
      return response.json();
    },
    enabled: !!mode
  });
}

export function useFeedbackList() {
  return useQuery({
    queryKey: ["feedback-list"],
    queryFn: async () => {
      const response = await fetch(api.feedback.list.path, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });
      if (!response.ok) throw new Error("Failed to fetch feedback list");
      return response.json();
    }
  });
}

export function useAnalyzeSingle() {
  return useMutation({
    mutationFn: async (feedbackId: string) => {
      const response = await fetch(api.rag.analyzeSingle.path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify({ feedbackId }),
      });
      if (!response.ok) throw new Error("Failed to analyze feedback");
      return response.json();
    }
  });
}
