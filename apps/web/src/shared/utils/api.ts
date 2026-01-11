const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: Response,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = (await response.json()) as { message?: string };
      errorMessage = errorData.message || errorMessage;
    } catch {
      // Ignore JSON parsing errors
    }

    throw new ApiError(errorMessage, response.status, response);
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(endpoint: string) => fetchApi<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, data: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  patch: <T>(endpoint: string, data: unknown) =>
    fetchApi<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (endpoint: string) => fetchApi<void>(endpoint, { method: 'DELETE' }),
};
