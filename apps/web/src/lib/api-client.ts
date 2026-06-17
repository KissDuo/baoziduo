const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    if (options.params) {
      Object.entries(options.params).forEach(([k, v]) => url.searchParams.set(k, v));
    }

    const res = await fetch(url.toString(), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Send httpOnly cookies
    });

    if (!res.ok) {
      // 401 → try refresh token, then retry once
      if (res.status === 401 && typeof window !== 'undefined' && !(options.headers as any)?.['x-retry']) {
        try {
          const refreshRes = await fetch(`${this.baseUrl}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          });
          if (refreshRes.ok) {
            // Retry the original request with refreshed token
            return this.request<T>(path, {
              ...options,
              headers: { ...options.headers, 'x-retry': '1' },
            });
          }
        } catch {}
        // Refresh failed — redirect to login
        const current = window.location.pathname + window.location.search;
        window.location.href = `/login?redirect=${encodeURIComponent(current)}`;
        throw new ApiError(401, 'Please login first', 'AUTH_REQUIRED');
      }
      const body = await res.json().catch(() => ({}));
      throw new ApiError(res.status, body.error || 'Request failed', body.code);
    }

    return res.json();
  }

  get<T>(path: string, params?: Record<string, string>) {
    return this.request<T>(path, { method: 'GET', params });
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Singleton for client-side use
export const api = new ApiClient(API_BASE);

// Factory for server-side use (with custom base URL)
export function createApiClient(baseUrl?: string) {
  return new ApiClient(baseUrl || API_BASE);
}
