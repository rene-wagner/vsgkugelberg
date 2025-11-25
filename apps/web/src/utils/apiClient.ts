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

export type ApiCategory = {
  id: number;
  name: string;
  slug: string;
};

export type ApiTag = {
  id: number;
  name: string;
  slug: string;
};

export type ApiPost = {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  author: Omit<ApiUser, 'email'>;
  categories: ApiCategory[];
  tags: ApiTag[];
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PostsResponse = {
  data: ApiPost[];
  meta: PaginationMeta;
};

export type PostsFilters = {
  published?: boolean;
  category?: string;
  tag?: string;
  page?: number;
  limit?: number;
};

export type CreatePostPayload = {
  title: string;
  content: string;
  published: boolean;
  authorId: number;
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

export const fetchMe = async (): Promise<ApiUser | null> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/me`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { user: ApiUser };

  return data.user;
};

export const logout = async (): Promise<void> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Logout request failed');
  }
};

export const fetchPosts = async (filters: PostsFilters = {}): Promise<PostsResponse> => {
  const baseUrl = getApiBaseUrl();
  const params = new URLSearchParams();

  if (filters.published !== undefined) {
    params.set('published', String(filters.published));
  }
  if (filters.category) {
    params.set('category', filters.category);
  }
  if (filters.tag) {
    params.set('tag', filters.tag);
  }
  if (filters.page !== undefined) {
    params.set('page', String(filters.page));
  }
  if (filters.limit !== undefined) {
    params.set('limit', String(filters.limit));
  }

  const queryString = params.toString();
  const url = `${baseUrl}/api/posts${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }

  return (await response.json()) as PostsResponse;
};

export const createPost = async (payload: CreatePostPayload): Promise<ApiPost> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(errorData.message || 'Failed to create post');
  }

  return (await response.json()) as ApiPost;
};
