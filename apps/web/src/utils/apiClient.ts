type LoginPayload = {
  username: string;
  password: string;
};

export type ApiUser = {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

const getApiBaseUrl = (): string => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
  return baseUrl.replace(/\/$/, '');
};

export const login = async (payload: LoginPayload): Promise<ApiUser> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Login request failed');
  }

  const data = (await response.json()) as { user: ApiUser };

  return data.user;
};
