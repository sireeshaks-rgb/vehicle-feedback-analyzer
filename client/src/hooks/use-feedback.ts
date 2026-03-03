import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { getAuthToken } from "./use-auth";

export function useUploadFeedback() {
  return useMutation({
    mutationFn: async (file: File) => {
      const token = getAuthToken();
      if (!token) throw new Error("Not authenticated");

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(api.feedback.upload.path, {
        method: api.feedback.upload.method,
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Unauthorized - please log in again");
        if (res.status === 400) throw new Error("Invalid CSV format");
        throw new Error("Failed to upload feedback");
      }

      return api.feedback.upload.responses[200].parse(await res.json());
    }
  });
}
