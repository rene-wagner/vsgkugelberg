# Web Project Improvements Analysis

## Executive Summary

This document analyzes the VSG Kugelberg web application (Vue 3 + Pinia + Vue Router) and provides actionable improvements for components, structure, and overall architecture.

---

## 1. Component Architecture Improvements

### 1.1 Implement Composables for Reusable Logic

**Current State:**
- Components like `CategoriesListView.vue` contain inline logic for data fetching, flattening, and user interactions
- Similar patterns repeated across views (loading states, error handling, confirmations)

**Improvement:**
Create composables in `src/shared/composables/` to extract common patterns:

```typescript
// src/shared/composables/useApiState.ts
export function useApiState<T>() {
  const data = ref<T | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function execute(fn: () => Promise<T>) {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await fn();
      data.value = result;
      return result;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  return { data, isLoading, error, execute };
}
```

```typescript
// src/shared/composables/useConfirmation.ts
export function useConfirmation() {
  function confirm(message: string): boolean {
    return window.confirm(message);
  }

  async function confirmAsync(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(confirm(message));
    });
  }

  return { confirm, confirmAsync };
}
```

```typescript
// src/shared/composables/useSuccessMessage.ts
export function useSuccessMessage(duration = 5000) {
  const message = ref<string | null>(null);
  let timer: ReturnType<typeof setTimeout> | null = null;

  function show(msg: string) {
    message.value = msg;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      message.value = null;
    }, duration);
  }

  function clear() {
    if (timer) clearTimeout(timer);
    message.value = null;
  }

  onUnmounted(() => {
    if (timer) clearTimeout(timer);
  });

  return { message, show, clear };
}
```

**Benefits:**
- Reduces code duplication
- Improves testability
- Makes components more focused

### 1.2 Extract Common UI Patterns

**Current State:**
- Inline confirmation dialogs throughout views
- Repeated loading/error state templates
- Manual success message handling in multiple views

**Improvement:**
Create shared UI components:

```vue
<!-- src/shared/components/VsgConfirmDialog.vue -->
<script setup lang="ts">
interface Props {
  modelValue: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Bestätigen',
  message: 'Möchtest du diese Aktion wirklich durchführen?',
  confirmText: 'Ja',
  cancelText: 'Abbrechen',
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
}>();
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="fixed inset-0 z-50">
        <div class="modal-overlay" @click="$emit('update:modelValue', false)" />
        <div class="modal-content">
          <h3>{{ title }}</h3>
          <p>{{ message }}</p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="$emit('update:modelValue', false)">
              {{ cancelText }}
            </button>
            <button
              class="btn-primary"
              @click="$emit('confirm'); $emit('update:modelValue', false)"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
```

```vue
<!-- src/shared/components/VsgApiState.vue -->
<script setup lang="ts">
defineProps<{
  isLoading: boolean;
  error: string | null;
  empty?: boolean;
  emptyMessage?: string;
}>();
</script>

<template>
  <!-- Loading -->
  <div v-if="isLoading" class="api-state-loading">
    <VsgSpinner />
    <span>Laden...</span>
  </div>

  <!-- Error -->
  <div v-else-if="error" class="api-state-error">
    <VsgIcon name="alert-circle" />
    <span>{{ error }}</span>
  </div>

  <!-- Empty -->
  <div v-else-if="empty" class="api-state-empty">
    <VsgIcon name="inbox" />
    <span>{{ emptyMessage || 'Keine Daten vorhanden' }}</span>
  </div>

  <!-- Content -->
  <slot v-else />
</template>
```

### 1.3 Improve Component Exports

**Current State:**
- `src/shared/components/index.ts` only exports 7 of 24+ components
- Missing exports for important components like `VsgButton`, `VsgIconButton`, `VsgNavbar`, `VsgFooter`

**Improvement:**
Auto-generate or manually maintain complete exports:

```typescript
// src/shared/components/index.ts
export { default as VsgButton } from './VsgButton.vue';
export { default as VsgIconButton } from './VsgIconButton.vue';
export { default as VsgNavbar } from './VsgNavbar.vue';
export { default as VsgFooter } from './VsgFooter.vue';
export { default as VsgFactCard } from './VsgFactCard.vue';
export { default as VsgTimeline } from './VsgTimeline.vue';
export { default as VsgChart } from './VsgChart.vue';
export { default as VsgAccordion } from './VsgAccordion.vue';
export { default as VsgSuccessList } from './VsgSuccessList.vue';
export { default as VsgMarkdownRenderer } from './VsgMarkdownRenderer.vue';
export { default as VsgMarkdownEditor } from './VsgMarkdownEditor.vue';
export { default as VsgPasswordInput } from './VsgPasswordInput.vue';
export { default as VsgPagination } from './VsgPagination.vue';
export { default as VsgSectionHeader } from './VsgSectionHeader.vue';
export { default as VsgTreeSelect } from './VsgTreeSelect.vue';
export { default as VsgContactPersonSelect } from './VsgContactPersonSelect.vue';
export { default as VsgLinkArrow } from './VsgLinkArrow.vue';
```

### 1.4 Use Async Components for Large Components

**Current State:**
- All components imported synchronously
- Components like `MediaGallery.vue` (23KB), `EventForm.vue` (16KB) loaded immediately

**Improvement:**
Lazy load heavy components and form pages:

```typescript
// src/modules/admin/router/routes.ts
import AdminLayout from '@shared/layouts/AdminLayout.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('../views/AdminDashboard.vue'),
      },
      {
        path: 'media',
        name: 'admin-media',
        component: () => import('../views/MediaLibraryView.vue'),
      },
      // ... other routes
    ],
  },
];
```

---

## 2. State Management Improvements (Pinia)

### 2.1 Extract API Layer

**Current State:**
- Each store contains duplicate fetch logic
- `API_BASE_URL` duplicated across stores
- No centralized error handling
- No request/response interceptors

**Improvement:**
Create an API client layer:

```typescript
// src/shared/utils/api.ts
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

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
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
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {}

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
  delete: (endpoint: string) =>
    fetchApi<void>(endpoint, { method: 'DELETE' }),
};
```

Refactored store example:

```typescript
// src/modules/admin/stores/categoriesStore.ts
import { api } from '@shared/utils/api';

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<Category[]>([]);
  const isRecalculating = ref(false);
  const error = ref<string | null>(null);

  async function fetchCategories(): Promise<void> {
    try {
      categories.value = await api.get<Category[]>('/api/categories');
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
    }
  }

  async function createCategory(data: CreateCategoryData): Promise<Category> {
    const newCategory = await api.post<Category>('/api/categories', data);
    categories.value.push(newCategory);
    return newCategory;
  }

  async function updateCategory(
    slug: string,
    data: UpdateCategoryData,
  ): Promise<Category> {
    const updatedCategory = await api.patch<Category>(
      `/api/categories/${slug}`,
      data,
    );
    const index = categories.value.findIndex((c) => c.slug === slug);
    if (index !== -1) {
      categories.value[index] = updatedCategory;
    }
    return updatedCategory;
  }

  async function deleteCategory(slug: string): Promise<void> {
    await api.delete(`/api/categories/${slug}`);
    await fetchCategories(); // Refresh to update tree structure
  }

  return {
    categories,
    isRecalculating,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
});
```

**Benefits:**
- Centralized error handling
- DRY API logic
- Easier to add interceptors (auth tokens, logging)
- Type-safe API calls

### 2.2 Create a Base Store Composable

**Current State:**
- Each store manually manages `isLoading`, `error`, `successMessage`
- Inconsistent loading state management

**Improvement:**
Create a reusable store pattern:

```typescript
// src/shared/composables/useStoreState.ts
export function createStoreState<T>(initialData?: T) {
  const data = ref<T | null>(initialData ?? null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const successMessage = ref<string | null>(null);

  async function execute<R>(fn: () => Promise<R>): Promise<R> {
    isLoading.value = true;
    error.value = null;
    successMessage.value = null;

    try {
      const result = await fn();
      successMessage.value = 'Operation successful';
      return result;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  function reset() {
    data.value = initialData ?? null;
    isLoading.value = false;
    error.value = null;
    successMessage.value = null;
  }

  return {
    data,
    isLoading,
    error,
    successMessage,
    execute,
    reset,
  };
}
```

### 2.3 Use Getters for Derived State

**Current State:**
- Derived state computed in components (e.g., `flattenCategories` in `CategoriesListView.vue`)
- No computed properties in stores

**Improvement:**
Add getters to stores:

```typescript
export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<Category[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const flatCategories = computed(() => {
    function flatten(
      items: Category[],
      depth = 0,
    ): FlattenedCategory[] {
      const result: FlattenedCategory[] = [];
      for (const item of items) {
        result.push({ ...item, depth });
        if (item.children?.length > 0) {
          result.push(...flatten(item.children, depth + 1));
        }
      }
      return result;
    }
    return flatten(categories.value);
  });

  const categoriesByParent = computed(() => {
    const map = new Map<number | null, Category[]>();
    categories.value.forEach((cat) => {
      const key = cat.parentId;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(cat);
    });
    return map;
  });

  return {
    categories,
    isLoading,
    error,
    flatCategories,
    categoriesByParent,
  };
});
```

### 2.4 Store Composition

**Current State:**
- Stores operate independently
- No cross-store communication

**Improvement:**
Allow stores to compose and reference each other:

```typescript
// Example: A store that uses auth to check permissions
import { useAuthStore } from '../auth/stores/authStore';

export const useDepartmentsStore = defineStore('departments', () => {
  const authStore = useAuthStore();

  const canEdit = computed(() => {
    return authStore.user?.permissions?.includes('edit:departments');
  });

  async function fetchDepartments() {
    if (!canEdit.value) {
      throw new Error('Unauthorized');
    }
    // ... fetch logic
  }

  return { canEdit, fetchDepartments };
});
```

---

## 3. Routing Improvements (Vue Router)

### 3.1 Add Route Meta Types

**Current State:**
- Route meta uses implicit types (`requiresAuth: true`)
- No type safety for custom meta fields

**Improvement:**

```typescript
// src/router/types.ts
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    requiresPermission?: string[];
    title?: string;
    breadcrumb?: BreadcrumbItem[];
  }

  interface BreadcrumbItem {
    label: string;
    to?: string;
  }
}
```

### 3.2 Implement Route-based Code Splitting

**Current State:**
- All route components loaded at startup
- Large initial bundle size

**Improvement:**
Already shown in 1.4 - lazy load all route components except critical ones.

### 3.3 Add Page Transitions

**Current State:**
- No transitions between routes
- Jarring navigation experience

**Improvement:**

```vue
<!-- src/App.vue -->
<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
const transitionName = computed(() => {
  return route.meta.transition || 'fade';
});
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <Transition :name="transitionName" mode="out-in">
      <component :is="Component" :key="route.path" />
    </Transition>
  </router-view>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(-100%);
}
</style>
```

### 3.4 Implement Scroll Behavior

**Current State:**
- No scroll management
- Scroll position not restored on navigation

**Improvement:**

```typescript
// src/router/index.ts
const router = createRouter({
  history: createWebHistory(),
  routes: [...defaultRoutes, ...adminRoutes, ...authRoutes],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else if (to.hash) {
      return { el: to.hash };
    } else {
      return { top: 0 };
    }
  },
});
```

### 3.5 Add Navigation Guards for Permissions

**Current State:**
- Simple auth check in global guard
- No role-based or permission-based access control

**Improvement:**

```typescript
// src/router/guards.ts
export function setupPermissionGuard(router: Router) {
  router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const requiredPermissions = to.meta.requiresPermission;

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return next();
    }

    const userPermissions = authStore.user?.permissions || [];
    const hasPermission = requiredPermissions.some((perm) =>
      userPermissions.includes(perm),
    );

    if (!hasPermission) {
      // Show error or redirect
      return next({ name: 'admin-dashboard' });
    }

    next();
  });
}
```

---

## 4. TypeScript Improvements

### 4.1 Shared Type Definitions

**Current State:**
- Types scattered in individual store files
- `DepartmentExtended` and `HistoryContent` in module-level type files
- No centralized type definitions

**Improvement:**
Create shared type system:

```typescript
// src/shared/types/common.ts
export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateDto {
  // Base interface for create operations
}

export interface UpdateDto {
  // Base interface for update operations
}
```

```typescript
// src/shared/types/media.ts
export interface MediaItem extends BaseEntity {
  filename: string;
  originalName: string;
  path: string;
  mimetype: string;
  size: number;
  type: string;
}

export interface MediaFilter {
  type?: string;
  search?: string;
}
```

```typescript
// src/modules/admin/types/index.ts
export * from './department-extended.types';
export * from './history.types';
export type { MediaItem } from '@shared/types/media';
```

### 4.2 Strict Mode for Pinia

**Current State:**
- TypeScript enabled but could be stricter

**Improvement:**
Use stricter typing for stores:

```typescript
// Use explicit state interface
interface CategoriesState {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

export const useCategoriesStore = defineStore('categories', () => {
  const state = reactive<CategoriesState>({
    categories: [],
    isLoading: false,
    error: null,
  });

  // ... rest of store logic

  return {
    ...toRefs(state),
    fetchCategories,
    // ...
  };
});
```

---

## 5. Error Handling Improvements

### 5.1 Global Error Handler

**Current State:**
- Error handling scattered across components
- `window.confirm` for user confirmations
- No global error boundary

**Improvement:**

```typescript
// src/shared/composables/useErrorHandler.ts
export function useErrorHandler() {
  const toast = useToast();

  function handleError(error: unknown): string {
    let message = 'An unexpected error occurred';

    if (error instanceof ApiError) {
      switch (error.statusCode) {
        case 401:
          message = 'You need to log in to perform this action';
          break;
        case 403:
          message = "You don't have permission to do this";
          break;
        case 404:
          message = 'The requested resource was not found';
          break;
        case 500:
          message = 'Server error. Please try again later';
          break;
        default:
          message = error.message;
      }
    } else if (error instanceof Error) {
      message = error.message;
    }

    toast.error(message);
    return message;
  }

  return { handleError };
}
```

### 5.2 Add Toast Notification System

**Current State:**
- Manual success message clearing with timers
- No toast notifications for errors
- Inconsistent error display

**Improvement:**

```typescript
// src/shared/composables/useToast.ts
export function useToast() {
  const toasts = ref<ToastMessage[]>([]);

  function show(message: string, type: 'success' | 'error' | 'warning' | 'info') {
    const id = Date.now();
    toasts.value.push({ id, message, type });
    setTimeout(() => remove(id), 5000);
  }

  function success(message: string) {
    show(message, 'success');
  }

  function error(message: string) {
    show(message, 'error');
  }

  function warning(message: string) {
    show(message, 'warning');
  }

  function info(message: string) {
    show(message, 'info');
  }

  function remove(id: number) {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  }

  return { toasts, success, error, warning, info, remove };
}
```

---

## 6. Code Organization Improvements

### 6.1 Feature-based Structure

**Current State:**
- Good: Modules are separated (admin, auth, default)
- Could improve: More granular feature organization

**Improvement:**
Consider organizing by feature:

```
src/
├── features/
│   ├── departments/
│   │   ├── components/
│   │   │   ├── DepartmentCard.vue
│   │   │   ├── DepartmentForm.vue
│   │   │   └── index.ts
│   │   ├── composables/
│   │   │   └── useDepartment.ts
│   │   ├── stores/
│   │   │   └── departmentsStore.ts
│   │   ├── types/
│   │   │   └── department.types.ts
│   │   └── views/
│   │       └── DepartmentDetailView.vue
│   ├── auth/
│   │   ├── components/
│   │   ├── stores/
│   │   └── views/
│   └── categories/
│       └── ...
├── shared/
│   ├── components/
│   ├── composables/
│   ├── utils/
│   └── types/
└── router/
```

### 6.2 Barrel Exports for Modules

**Current State:**
- No module-level barrel files
- Deep import paths (`@modules/admin/components/DepartmentForm.vue`)

**Improvement:**

```typescript
// src/modules/admin/index.ts
export * from './components';
export * from './stores';
export * from './types';
export { default as AdminRoutes } from './router/routes';

// src/modules/admin/components/index.ts
export { default as DepartmentForm } from './DepartmentForm.vue';
export { default as CategoryForm } from './CategoryForm.vue';
// ... other exports
```

---

## 7. Performance Improvements

### 7.1 Virtual Scrolling for Large Lists

**Current State:**
- Standard v-for for all lists
- Potential performance issues with large datasets

**Improvement:**
Use `vue-virtual-scroller` or similar for large lists:

```typescript
// src/shared/components/VsgVirtualList.vue
<script setup lang="ts">
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

defineProps<{
  items: any[];
  itemSize: number;
}>();
</script>

<template>
  <RecycleScroller
    class="scroller"
    :items="items"
    :item-size="itemSize"
    key-field="id"
    v-slot="{ item }"
  >
    <slot :item="item" />
  </RecycleScroller>
</template>
```

### 7.2 Debounce Search Inputs

**Current State:**
- No debouncing on search/filter inputs
- Potential excessive API calls

**Improvement:**

```typescript
// src/shared/composables/useDebounce.ts
export function useDebounce<T>(value: Ref<T>, delay = 300): Ref<T> {
  const debouncedValue = ref(value.value) as Ref<T>;
  let timeout: ReturnType<typeof setTimeout>;

  watch(value, (newValue) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      debouncedValue.value = newValue;
    }, delay);
  });

  return debouncedValue;
}

// Usage in component:
const searchTerm = ref('');
const debouncedSearch = useDebounce(searchTerm, 300);

watch(debouncedSearch, (term) => {
  store.fetchResults(term);
});
```

### 7.3 Image Optimization

**Current State:**
- No lazy loading for images
- No responsive image handling

**Improvement:**

```vue
<!-- src/shared/components/VsgImage.vue -->
<script setup lang="ts">
const props = defineProps<{
  src: string;
  alt: string;
  lazy?: boolean;
  width?: number;
  height?: number;
}>();

const imageRef = ref<HTMLImageElement>();
const isVisible = ref(!props.lazy);

onMounted(() => {
  if (props.lazy && imageRef.value) {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        isVisible.value = true;
        observer.disconnect();
      }
    });
    observer.observe(imageRef.value);
  }
});
</script>

<template>
  <img
    v-if="isVisible"
    ref="imageRef"
    :src="src"
    :alt="alt"
    :width="width"
    :height="height"
    loading="lazy"
  />
</template>
```

---

## 8. Testing Improvements

### 8.1 Add Unit Tests

**Current State:**
- Vitest configured but no test files exist
- Zero test coverage

**Improvement:**
Start with critical path testing:

```typescript
// src/modules/admin/stores/__tests__/categoriesStore.spec.ts
import { setActivePinia, createPinia } from 'pinia';
import { useCategoriesStore } from '../categoriesStore';
import { api } from '@shared/utils/api';

vi.mock('@shared/utils/api');

describe('useCategoriesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should fetch categories successfully', async () => {
    const mockCategories = [{ id: 1, name: 'Test' }];
    vi.mocked(api.get).mockResolvedValue(mockCategories);

    const store = useCategoriesStore();
    await store.fetchCategories();

    expect(store.categories).toEqual(mockCategories);
    expect(api.get).toHaveBeenCalledWith('/api/categories');
  });

  it('should handle errors', async () => {
    vi.mocked(api.get).mockRejectedValue(new ApiError('Error', 500));

    const store = useCategoriesStore();
    await store.fetchCategories();

    expect(store.error).toBe('Error');
    expect(store.categories).toEqual([]);
  });
});
```

```typescript
// src/shared/components/__tests__/VsgButton.spec.ts
import { mount } from '@vue/test-utils';
import VsgButton from '../VsgButton.vue';

describe('VsgButton', () => {
  it('renders primary variant by default', () => {
    const wrapper = mount(VsgButton);
    expect(wrapper.classes()).toContain('btn-primary');
  });

  it('emits click event', async () => {
    const wrapper = mount(VsgButton);
    await wrapper.trigger('click');
    expect(wrapper.emitted()).toHaveProperty('click');
  });

  it('applies size classes', () => {
    const wrapper = mount(VsgButton, { props: { size: 'lg' } });
    expect(wrapper.classes()).toContain('text-2xl');
  });
});
```

### 8.2 Add Component Testing

```typescript
// src/modules/admin/views/__tests__/CategoriesListView.spec.ts
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import { createPinia } from 'pinia';
import CategoriesListView from '../CategoriesListView.vue';

describe('CategoriesListView', () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [],
  });

  it('should display categories', async () => {
    const wrapper = mount(CategoriesListView, {
      global: {
        plugins: [router, createPinia()],
      },
    });

    // Mock store and test rendering
    expect(wrapper.text()).toContain('KATEGORIEN');
  });
});
```

---

## 9. Accessibility Improvements

### 9.1 Add ARIA Labels

**Current State:**
- Some components missing ARIA attributes
- Inline SVG icons without aria-label

**Improvement:**

```vue
<!-- src/shared/components/VsgButton.vue -->
<button
  :aria-label="ariaLabel || $slots.default?.toString()"
  :disabled="disabled"
  :class="[baseClasses, variantClasses[variant], sizeClasses[size], glowClass]"
>
  <slot />
</button>
```

```vue
<!-- Add aria-label to icons -->
<svg
  class="w-5 h-5"
  fill="none"
  stroke="currentColor"
  viewBox="0 0 24 24"
  aria-hidden="true"
  role="presentation"
>
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="icon" />
</svg>
```

### 9.2 Keyboard Navigation

**Current State:**
- Tab navigation works but needs verification
- Custom interactive elements may have issues

**Improvement:**

```vue
<!-- Add keyboard support to custom components -->
<script setup lang="ts">
function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleClick();
  }
}
</script>

<template>
  <div
    role="button"
    tabindex="0"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <slot />
  </div>
</template>
```

### 9.3 Focus Management

```typescript
// src/shared/composables/useFocusTrap.ts
export function useFocusTrap(elementRef: Ref<HTMLElement | null>) {
  let previouslyFocused: HTMLElement | null;

  onMounted(() => {
    const element = elementRef.value;
    if (!element) return;

    previouslyFocused = document.activeElement as HTMLElement;
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    firstFocusable?.focus();
  });

  onUnmounted(() => {
    previouslyFocused?.focus();
  });
}
```

---

## 10. Utility Improvements

### 10.1 Date Formatting

```typescript
// src/shared/utils/date.ts
export function formatDate(date: string | Date, locale = 'de-DE'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(
  date: string | Date,
  locale = 'de-DE',
): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatRelativeTime(
  date: string | Date,
  locale = 'de-DE',
): string {
  const now = new Date();
  const then = new Date(date);
  const diff = then.getTime() - now.getTime();

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days >= 365) {
    return rtf.format(Math.floor(days / 365), 'year');
  } else if (days >= 30) {
    return rtf.format(Math.floor(days / 30), 'month');
  } else if (days >= 7) {
    return rtf.format(Math.floor(days / 7), 'week');
  } else if (days >= 1) {
    return rtf.format(days, 'day');
  } else if (hours >= 1) {
    return rtf.format(hours, 'hour');
  } else if (minutes >= 1) {
    return rtf.format(minutes, 'minute');
  } else {
    return rtf.format(seconds, 'second');
  }
}
```

### 10.2 Validation Utilities

```typescript
// src/shared/utils/validation.ts
export interface ValidationRule {
  validate: (value: string) => boolean;
  message: string;
}

export function required(message = 'Dieses Feld ist erforderlich'): ValidationRule {
  return {
    validate: (value) => !!value && value.trim().length > 0,
    message,
  };
}

export function email(message = 'Ungültige E-Mail-Adresse'): ValidationRule {
  return {
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  };
}

export function minLength(
  min: number,
  message?: string,
): ValidationRule {
  return {
    validate: (value) => value.length >= min,
    message || `Mindestens ${min} Zeichen erforderlich`,
  };
}

export function maxLength(
  max: number,
  message?: string,
): ValidationRule {
  return {
    validate: (value) => value.length <= max,
    message || `Maximal ${max} Zeichen erlaubt`,
  };
}

export function validate(value: string, rules: ValidationRule[]): string[] {
  const errors: string[] = [];
  for (const rule of rules) {
    if (!rule.validate(value)) {
      errors.push(rule.message);
    }
  }
  return errors;
}
```

### 10.3 Form Validation Composable

```typescript
// src/shared/composables/useForm.ts
export function useForm<T extends Record<string, string>>(
  initialValues: T,
  validationRules: Record<keyof T, ValidationRule[]>,
) {
  const values = reactive<T>({ ...initialValues });
  const errors = reactive<Partial<Record<keyof T, string[]>>>({});
  const touched = reactive<Partial<Record<keyof T, boolean>>>({});
  const isValid = computed(() =>
    Object.values(errors).every((e) => e && e.length === 0),
  );

  function validateField(field: keyof T): boolean {
    if (validationRules[field]) {
      errors[field] = validate(values[field], validationRules[field]);
    }
    return (errors[field]?.length || 0) === 0;
  }

  function validateAll(): boolean {
    let valid = true;
    for (const field of Object.keys(validationRules) as (keyof T)[]) {
      if (!validateField(field)) {
        valid = false;
      }
    }
    return valid;
  }

  function reset() {
    Object.assign(values, initialValues);
    Object.keys(errors).forEach((key) => {
      delete errors[key as keyof T];
    });
    Object.keys(touched).forEach((key) => {
      delete touched[key as keyof T];
    });
  }

  function handleInput(field: keyof T, value: string) {
    values[field] = value;
    if (touched[field]) {
      validateField(field);
    }
  }

  function handleBlur(field: keyof T) {
    touched[field] = true;
    validateField(field);
  }

  return {
    values,
    errors,
    touched,
    isValid,
    validateField,
    validateAll,
    reset,
    handleInput,
    handleBlur,
  };
}
```

---

## 11. Documentation Improvements

### 11.1 Component Documentation

**Current State:**
- Minimal JSDoc comments
- No component README files

**Improvement:**

```vue
<!--
  @component VsgButton

  A customizable button component with multiple variants, sizes, and glow effects.

  @example
  <VsgButton variant="primary" size="md" glow>
    Click me
  </VsgButton>

  @props {
    variant?: 'primary' | 'secondary' | 'outline' - Button style variant
    size?: 'sm' | 'md' | 'lg' - Button size
    glow?: boolean - Whether to apply glow effect
  }

  @slots {
    default - Button content
  }
-->
<script setup lang="ts">
// ... component code
</script>
```

### 11.2 Store Documentation

```typescript
/**
 * Categories Store
 *
 * Manages category CRUD operations and hierarchical data structure.
 *
 * @example
 * ```ts
 * const store = useCategoriesStore();
 * await store.fetchCategories();
 * ```
 *
 * @state
 * - categories: Array of all categories with nested children
 * - isLoading: Loading state for async operations
 * - error: Error message if any operation failed
 *
 * @actions
 * - fetchCategories(): Load all categories
 * - fetchCategory(slug): Load single category by slug
 * - createCategory(data): Create new category
 * - updateCategory(slug, data): Update existing category
 * - deleteCategory(slug): Delete category and refresh tree
 * - recalculateSlugs(): Recalculate all category slugs
 */
export const useCategoriesStore = defineStore('categories', () => {
  // ...
});
```

---

## 12. Security Improvements

### 12.1 Content Security Policy

```typescript
// src/main.ts
document.addEventListener('DOMContentLoaded', () => {
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self' data:;
    connect-src 'self' ${import.meta.env.VITE_API_BASE_URL};
  `;
  document.head.appendChild(meta);
});
```

### 12.2 XSS Prevention

```typescript
// src/shared/utils/sanitize.ts
export function sanitizeHtml(html: string): string {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
}

// Use VsgMarkdownRenderer instead of v-html
// If using v-html is necessary:
<template>
  <div v-html="sanitizeHtml(userInput)" />
</template>
```

---

## 13. Build Optimization

### 13.1 Bundle Analysis

**Current State:**
- No bundle analysis configured
- Unknown bundle sizes

**Improvement:**

```typescript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    // ... existing plugins
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
  ],
});
```

### 13.2 Tree-shaking

**Current State:**
- Some imports may not be tree-shakeable

**Improvement:**

```typescript
// Bad - imports entire library
import * as Chart from 'chart.js';

// Good - imports only what's needed
import { Chart, BarController, BarElement, CategoryScale } from 'chart.js';

// Register only used components
Chart.register(BarController, BarElement, CategoryScale);
```

---

## Implementation Priority

### Phase 1: Quick Wins (1-2 weeks)
1. ✅ Add barrel exports for components
2. ✅ Extract API layer
3. ✅ Add toast notification system
4. ✅ Implement debounce for search inputs
5. ✅ Add ARIA labels to components
6. ✅ Add error handler composable

### Phase 2: Medium Effort (2-4 weeks)
1. ✅ Create composables (useApiState, useConfirmation, useSuccessMessage)
2. ✅ Add shared UI components (VsgConfirmDialog, VsgApiState)
3. ✅ Implement route lazy loading
4. ✅ Add page transitions
5. ✅ Create shared type definitions
6. ✅ Refactor stores with new API layer

### Phase 3: Long-term Improvements (1-2 months)
1. ✅ Implement comprehensive testing
2. ✅ Add virtual scrolling
3. ✅ Create utility functions (date, validation)
4. ✅ Improve documentation
5. ✅ Add performance monitoring
6. ✅ Implement feature-based structure (if desired)

---

## Metrics to Track

- **Bundle Size**: Monitor initial JS bundle size
- **Time to Interactive**: Measure TTI improvements
- **Test Coverage**: Aim for >70% coverage
- **Code Duplication**: Reduce duplicate code patterns
- **Component Reusability**: Increase shared component usage
- **Type Safety**: Reduce `any` usage to near zero
- **Accessibility Score**: Target WCAG 2.1 AA compliance

---

## Conclusion

The VSG Kugelberg web application has a solid foundation with Vue 3, Pinia, and Vue Router. By implementing these improvements systematically, you can achieve:

1. **Better Code Organization**: Clearer structure, reduced duplication
2. **Improved Maintainability**: Easier to understand and modify
3. **Enhanced Performance**: Faster load times, better UX
4. **Increased Testability**: Reliable, testable code
5. **Better Developer Experience**: Consistent patterns, better tooling

Start with Phase 1 improvements for quick wins, then gradually work through Phase 2 and 3. Each improvement builds on the previous ones, creating a more robust and scalable application.
