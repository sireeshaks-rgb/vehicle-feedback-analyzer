import { z } from 'zod';
import { insertUserSchema, insertFeedbackSchema, authRequestSchema, queryRequestSchema, queryResponseSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/auth/register' as const,
      input: authRequestSchema.extend({ organizationName: z.string().optional() }),
      responses: {
        201: z.object({ token: z.string() }),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: authRequestSchema,
      responses: {
        200: z.object({ token: z.string() }),
        401: errorSchemas.unauthorized,
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: z.any(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  feedback: {
    submit: {
      method: 'POST' as const,
      path: '/api/feedback' as const,
      input: insertFeedbackSchema,
      responses: {
        201: z.object({ id: z.string() }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    upload: {
      method: 'POST' as const,
      path: '/api/upload' as const,
      // Input will be FormData with a CSV file
      responses: {
        200: z.object({ message: z.string(), count: z.number() }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/feedback' as const,
      responses: {
        200: z.array(z.any()),
        401: errorSchemas.unauthorized,
      },
    },
  },
  rag: {
    query: {
      method: 'POST' as const,
      path: '/api/query' as const,
      input: queryRequestSchema,
      responses: {
        200: queryResponseSchema,
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
    analyzeSingle: {
      method: 'POST' as const,
      path: '/api/analyze-single' as const,
      input: z.object({ feedbackId: z.string() }),
      responses: {
        200: z.object({ analysis: z.string() }),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
  },
  organizations: {
    list: {
      method: 'GET' as const,
      path: '/api/organizations' as const,
      responses: {
        200: z.array(z.any()),
        401: errorSchemas.unauthorized,
      },
    },
  },
  analytics: {
    cohorts: {
      method: 'GET' as const,
      path: '/api/analytics/cohorts' as const,
      responses: {
        200: z.array(z.any()),
        401: errorSchemas.unauthorized,
      },
    },
    summary: {
      method: 'GET' as const,
      path: '/api/analytics/summary' as const,
      responses: {
        200: z.any(),
        401: errorSchemas.unauthorized,
      },
    },
    transport: {
      method: 'GET' as const,
      path: '/api/analytics/transport/:mode' as const,
      responses: {
        200: z.any(),
        401: errorSchemas.unauthorized,
      },
    },
    heatmap: {
      method: 'GET' as const,
      path: '/api/analytics/heatmap' as const,
      responses: {
        200: z.array(z.any()),
        401: errorSchemas.unauthorized,
      },
    },
    forecast: {
      method: 'POST' as const,
      path: '/api/analytics/forecast' as const,
      input: z.object({ mode: z.enum(['Bus', 'Train', 'Airplane']), days: z.number().default(7) }),
      responses: {
        200: z.object({ forecast: z.string(), chartData: z.array(z.any()) }),
        500: errorSchemas.internal,
      },
    },
    mitigations: {
      method: 'GET' as const,
      path: '/api/analytics/mitigations' as const,
      responses: {
        200: z.array(z.any()),
        500: errorSchemas.internal,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
