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

export type UpdatePostPayload = {
  title?: string;
  content?: string;
  published?: boolean;
};

export type ApiDepartment = {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateDepartmentPayload = {
  name: string;
  shortDescription: string;
  longDescription: string;
};

export type UpdateDepartmentPayload = {
  name?: string;
  shortDescription?: string;
  longDescription?: string;
};

// Full category type with all fields (for CRUD operations)
export type ApiCategoryFull = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateCategoryPayload = {
  name: string;
  description?: string;
};

export type UpdateCategoryPayload = {
  name?: string;
  description?: string;
};

// User types for admin operations (reuses ApiUser for the response)
export type CreateUserPayload = {
  username: string;
  email: string;
  password: string;
};

export type UpdateUserPayload = {
  username?: string;
  email?: string;
  password?: string;
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

export const updatePost = async (slug: string, payload: UpdatePostPayload): Promise<ApiPost> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/posts/${slug}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(errorData.message || 'Failed to update post');
  }

  return (await response.json()) as ApiPost;
};

export const deletePost = async (slug: string): Promise<ApiPost> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/posts/${slug}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(errorData.message || 'Failed to delete post');
  }

  return (await response.json()) as ApiPost;
};

// Department API functions

export const fetchDepartments = async (): Promise<ApiDepartment[]> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/departments`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch departments');
  }

  return (await response.json()) as ApiDepartment[];
};

export const createDepartment = async (
  payload: CreateDepartmentPayload
): Promise<ApiDepartment> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/departments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(errorData.message || 'Failed to create department');
  }

  return (await response.json()) as ApiDepartment;
};

export const updateDepartment = async (
  slug: string,
  payload: UpdateDepartmentPayload
): Promise<ApiDepartment> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/departments/${slug}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(errorData.message || 'Failed to update department');
  }

  return (await response.json()) as ApiDepartment;
};

export const deleteDepartment = async (slug: string): Promise<ApiDepartment> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/departments/${slug}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(errorData.message || 'Failed to delete department');
  }

  return (await response.json()) as ApiDepartment;
};

// Category API functions

export const fetchCategories = async (): Promise<ApiCategoryFull[]> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/categories`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  return (await response.json()) as ApiCategoryFull[];
};

export const createCategory = async (payload: CreateCategoryPayload): Promise<ApiCategoryFull> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(errorData.message || 'Failed to create category');
  }

  return (await response.json()) as ApiCategoryFull;
};

export const updateCategory = async (
  slug: string,
  payload: UpdateCategoryPayload
): Promise<ApiCategoryFull> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/categories/${slug}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(errorData.message || 'Failed to update category');
  }

  return (await response.json()) as ApiCategoryFull;
};

export const deleteCategory = async (slug: string): Promise<ApiCategoryFull> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/categories/${slug}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(errorData.message || 'Failed to delete category');
  }

  return (await response.json()) as ApiCategoryFull;
};

// User API functions (admin operations)

export const fetchUsers = async (): Promise<ApiUser[]> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/users`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return (await response.json()) as ApiUser[];
};

export const createUser = async (payload: CreateUserPayload): Promise<ApiUser> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(errorData.message || 'Failed to create user');
  }

  return (await response.json()) as ApiUser;
};

export const updateUser = async (id: number, payload: UpdateUserPayload): Promise<ApiUser> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(errorData.message || 'Failed to update user');
  }

  return (await response.json()) as ApiUser;
};

export const deleteUser = async (id: number): Promise<ApiUser> => {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/users/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(errorData.message || 'Failed to delete user');
  }

  return (await response.json()) as ApiUser;
};
