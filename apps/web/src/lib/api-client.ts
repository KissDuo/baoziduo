const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5201/api/v1';

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    let url: string;
    if (this.baseUrl.startsWith('http')) {
      const u = new URL(`${this.baseUrl}${path}`);
      if (options.params) {
        Object.entries(options.params).forEach(([k, v]) => u.searchParams.set(k, v));
      }
      url = u.toString();
    } else {
      // Relative base URL (e.g. /api/v1) — construct path directly
      const params = new URLSearchParams(options.params);
      const qs = params.toString();
      url = `${this.baseUrl}${path}${qs ? '?' + qs : ''}`;
    }

    const res = await fetch(url, {
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
      const { error, code, ...extra } = body;
      throw new ApiError(res.status, error || 'Request failed', code, extra);
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
    public code?: string,
    extra?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    if (extra) Object.assign(this, extra);
  }
}

// Singleton for client-side use
export const api = new ApiClient(API_BASE);

// Factory for server-side use (with custom base URL)
export function createApiClient(baseUrl?: string) {
  return new ApiClient(baseUrl || API_BASE);
}
