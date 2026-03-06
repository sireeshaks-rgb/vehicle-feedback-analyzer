import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { QueryRequest } from "@shared/schema";

export function useRagQuery() {
  return useMutation({
    mutationFn: async (data: QueryRequest) => {
      const validated = api.rag.query.input.parse(data);

      const res = await fetch(api.rag.query.path, {
        method: api.rag.query.method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 400) throw new Error("Invalid query request");
        throw new Error("Failed to process query");
      }

      return api.rag.query.responses[200].parse(await res.json());
    }
  });
}
