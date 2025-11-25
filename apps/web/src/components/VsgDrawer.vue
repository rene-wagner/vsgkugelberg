<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { usePostsStore, type PublishedFilter } from '@/stores/posts';
import { useDepartmentsStore } from '@/stores/departments';
import { useCategoriesStore } from '@/stores/categories';
import { useUsersAdminStore } from '@/stores/usersAdmin';
import { useUserStore } from '@/stores/user';
import VsgPostForm, { type PostFormPayload } from './forms/VsgPostForm.vue';
import VsgDepartmentForm, { type DepartmentFormPayload } from './forms/VsgDepartmentForm.vue';
import VsgCategoryForm, { type CategoryFormPayload } from './forms/VsgCategoryForm.vue';
import VsgUserForm, { type UserFormPayload } from './forms/VsgUserForm.vue';
import type { ApiPost, ApiDepartment, ApiCategoryFull, ApiUser } from '@/utils/apiClient';

const props = defineProps<{
  isOpen: boolean;
  username: string;
}>();

const emit = defineEmits<{
  close: [];
  logout: [];
}>();

const isPostsPanelOpen = ref(false);
const isCreatingPost = ref(false);
const postsStore = usePostsStore();
const userStore = useUserStore();

// Departments state
const isDepartmentsPanelOpen = ref(false);
const isCreatingDepartment = ref(false);
const departmentsStore = useDepartmentsStore();

// Categories state
const isCategoriesPanelOpen = ref(false);
const isCreatingCategory = ref(false);
const categoriesStore = useCategoriesStore();

// Users state
const isUsersPanelOpen = ref(false);
const isCreatingUser = ref(false);
const usersAdminStore = useUsersAdminStore();

const {
  posts,
  loading,
  error,
  meta,
  publishedFilter,
  categoryFilter,
  tagFilter,
  creating,
  createError,
  selectedPost,
  updating,
  updateError,
  deleting,
  deleteError,
} = storeToRefs(postsStore);

// Computed state for edit mode (posts)
const isEditingPost = computed(() => !!selectedPost.value);
const isShowingPostForm = computed(() => isCreatingPost.value || isEditingPost.value);
const postFormLoading = computed(() => creating.value || updating.value || deleting.value);
const postFormError = computed(() => createError.value || updateError.value || deleteError.value);

// Departments store refs
const {
  departments,
  loading: departmentsLoading,
  error: departmentsError,
  creating: departmentsCreating,
  createError: departmentsCreateError,
  selectedDepartment,
  updating: departmentsUpdating,
  updateError: departmentsUpdateError,
  deleting: departmentsDeleting,
  deleteError: departmentsDeleteError,
} = storeToRefs(departmentsStore);

// Computed state for edit mode (departments)
const isEditingDepartment = computed(() => !!selectedDepartment.value);
const isShowingDepartmentForm = computed(
  () => isCreatingDepartment.value || isEditingDepartment.value
);
const departmentFormLoading = computed(
  () => departmentsCreating.value || departmentsUpdating.value || departmentsDeleting.value
);
const departmentFormError = computed(
  () => departmentsCreateError.value || departmentsUpdateError.value || departmentsDeleteError.value
);

// Categories store refs
const {
  categories,
  loading: categoriesLoading,
  error: categoriesError,
  creating: categoriesCreating,
  createError: categoriesCreateError,
  selectedCategory,
  updating: categoriesUpdating,
  updateError: categoriesUpdateError,
  deleting: categoriesDeleting,
  deleteError: categoriesDeleteError,
} = storeToRefs(categoriesStore);

// Computed state for edit mode (categories)
const isEditingCategory = computed(() => !!selectedCategory.value);
const isShowingCategoryForm = computed(() => isCreatingCategory.value || isEditingCategory.value);
const categoryFormLoading = computed(
  () => categoriesCreating.value || categoriesUpdating.value || categoriesDeleting.value
);
const categoryFormError = computed(
  () => categoriesCreateError.value || categoriesUpdateError.value || categoriesDeleteError.value
);

// Users store refs
const {
  users,
  loading: usersLoading,
  error: usersError,
  creating: usersCreating,
  createError: usersCreateError,
  selectedUser,
  updating: usersUpdating,
  updateError: usersUpdateError,
  deleting: usersDeleting,
  deleteError: usersDeleteError,
} = storeToRefs(usersAdminStore);

// Computed state for edit mode (users)
const isEditingUser = computed(() => !!selectedUser.value);
const isShowingUserForm = computed(() => isCreatingUser.value || isEditingUser.value);
const userFormLoading = computed(
  () => usersCreating.value || usersUpdating.value || usersDeleting.value
);
const userFormError = computed(
  () => usersCreateError.value || usersUpdateError.value || usersDeleteError.value
);

const quickLinks = [
  { label: 'Mein Profil', path: '/profil' },
  { label: 'Einstellungen', path: '/einstellungen' },
  { label: 'Nachrichten', path: '/nachrichten' },
  { label: 'Hilfe', path: '/hilfe' },
];

// Reset posts and departments panel and form state when drawer closes
watch(
  () => props.isOpen,
  (isOpen) => {
    if (!isOpen) {
      // Reset posts state
      isPostsPanelOpen.value = false;
      isCreatingPost.value = false;
      postsStore.selectPost(null);
      postsStore.clearCreateError();
      postsStore.clearUpdateError();
      postsStore.clearDeleteError();
      // Reset departments state
      isDepartmentsPanelOpen.value = false;
      isCreatingDepartment.value = false;
      departmentsStore.selectDepartment(null);
      departmentsStore.clearCreateError();
      departmentsStore.clearUpdateError();
      departmentsStore.clearDeleteError();
      // Reset categories state
      isCategoriesPanelOpen.value = false;
      isCreatingCategory.value = false;
      categoriesStore.selectCategory(null);
      categoriesStore.clearCreateError();
      categoriesStore.clearUpdateError();
      categoriesStore.clearDeleteError();
      // Reset users state
      isUsersPanelOpen.value = false;
      isCreatingUser.value = false;
      usersAdminStore.selectUser(null);
      usersAdminStore.clearCreateError();
      usersAdminStore.clearUpdateError();
      usersAdminStore.clearDeleteError();
    }
  }
);

// Fetch posts when panel opens
watch(isPostsPanelOpen, (isOpen) => {
  if (isOpen) {
    postsStore.fetchPosts();
  }
});

// Fetch departments when panel opens
watch(isDepartmentsPanelOpen, (isOpen) => {
  if (isOpen) {
    departmentsStore.fetchDepartments();
  }
});

// Fetch categories when panel opens
watch(isCategoriesPanelOpen, (isOpen) => {
  if (isOpen) {
    categoriesStore.fetchCategories();
  }
});

// Fetch users when panel opens
watch(isUsersPanelOpen, (isOpen) => {
  if (isOpen) {
    usersAdminStore.fetchUsers();
  }
});

const handleOverlayClick = () => {
  emit('close');
};

const handleCloseClick = () => {
  emit('close');
};

const handleLogoutClick = () => {
  emit('logout');
};

const openPostsPanel = () => {
  isPostsPanelOpen.value = true;
};

const closePostsPanel = () => {
  isPostsPanelOpen.value = false;
  isCreatingPost.value = false;
  postsStore.selectPost(null);
  postsStore.clearCreateError();
  postsStore.clearUpdateError();
  postsStore.clearDeleteError();
};

// Post creation handlers
const openCreatePostForm = () => {
  isCreatingPost.value = true;
  postsStore.clearCreateError();
};

const closeCreatePostForm = () => {
  isCreatingPost.value = false;
  postsStore.clearCreateError();
};

// Post editing handlers
const openEditPostForm = (post: ApiPost) => {
  postsStore.selectPost(post);
  postsStore.clearUpdateError();
  postsStore.clearDeleteError();
};

const closeEditPostForm = () => {
  postsStore.selectPost(null);
  postsStore.clearUpdateError();
  postsStore.clearDeleteError();
};

const handlePostFormSave = async (payload: PostFormPayload) => {
  if (!userStore.user) {
    return;
  }

  if (isEditingPost.value && selectedPost.value) {
    // Update existing post
    const success = await postsStore.updatePost(selectedPost.value.slug, {
      title: payload.title,
      content: payload.content,
      published: payload.published,
    });

    if (success) {
      postsStore.selectPost(null);
    }
  } else {
    // Create new post
    const success = await postsStore.createPost({
      title: payload.title,
      content: payload.content,
      published: payload.published,
      authorId: userStore.user.id,
    });

    if (success) {
      isCreatingPost.value = false;
    }
  }
};

const handleDeletePost = async () => {
  if (!selectedPost.value) {
    return;
  }

  const success = await postsStore.deletePost(selectedPost.value.slug);

  if (success) {
    postsStore.selectPost(null);
  }
};

const handlePostFormCancel = () => {
  if (isEditingPost.value) {
    closeEditPostForm();
  } else {
    closeCreatePostForm();
  }
};

// Filter handlers
const handlePublishedFilterChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value as PublishedFilter;
  postsStore.setPublishedFilter(value);
};

const handleCategoryFilterChange = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  postsStore.setCategoryFilter(value);
};

const handleTagFilterChange = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  postsStore.setTagFilter(value);
};

// Date formatting helper
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Departments panel handlers
const openDepartmentsPanel = () => {
  isDepartmentsPanelOpen.value = true;
};

const closeDepartmentsPanel = () => {
  isDepartmentsPanelOpen.value = false;
  isCreatingDepartment.value = false;
  departmentsStore.selectDepartment(null);
  departmentsStore.clearCreateError();
  departmentsStore.clearUpdateError();
  departmentsStore.clearDeleteError();
};

// Department creation handlers
const openCreateDepartmentForm = () => {
  isCreatingDepartment.value = true;
  departmentsStore.clearCreateError();
};

const closeCreateDepartmentForm = () => {
  isCreatingDepartment.value = false;
  departmentsStore.clearCreateError();
};

// Department editing handlers
const openEditDepartmentForm = (department: ApiDepartment) => {
  departmentsStore.selectDepartment(department);
  departmentsStore.clearUpdateError();
  departmentsStore.clearDeleteError();
};

const closeEditDepartmentForm = () => {
  departmentsStore.selectDepartment(null);
  departmentsStore.clearUpdateError();
  departmentsStore.clearDeleteError();
};

const handleDepartmentFormSave = async (payload: DepartmentFormPayload) => {
  if (isEditingDepartment.value && selectedDepartment.value) {
    // Update existing department
    const success = await departmentsStore.updateDepartment(selectedDepartment.value.slug, {
      name: payload.name,
      shortDescription: payload.shortDescription,
      longDescription: payload.longDescription,
    });

    if (success) {
      departmentsStore.selectDepartment(null);
    }
  } else {
    // Create new department
    const success = await departmentsStore.createDepartment({
      name: payload.name,
      shortDescription: payload.shortDescription,
      longDescription: payload.longDescription,
    });

    if (success) {
      isCreatingDepartment.value = false;
    }
  }
};

const handleDeleteDepartment = async () => {
  if (!selectedDepartment.value) {
    return;
  }

  const success = await departmentsStore.deleteDepartment(selectedDepartment.value.slug);

  if (success) {
    departmentsStore.selectDepartment(null);
  }
};

const handleDepartmentFormCancel = () => {
  if (isEditingDepartment.value) {
    closeEditDepartmentForm();
  } else {
    closeCreateDepartmentForm();
  }
};

// Categories panel handlers
const openCategoriesPanel = () => {
  isCategoriesPanelOpen.value = true;
};

const closeCategoriesPanel = () => {
  isCategoriesPanelOpen.value = false;
  isCreatingCategory.value = false;
  categoriesStore.selectCategory(null);
  categoriesStore.clearCreateError();
  categoriesStore.clearUpdateError();
  categoriesStore.clearDeleteError();
};

// Category creation handlers
const openCreateCategoryForm = () => {
  isCreatingCategory.value = true;
  categoriesStore.clearCreateError();
};

const closeCreateCategoryForm = () => {
  isCreatingCategory.value = false;
  categoriesStore.clearCreateError();
};

// Category editing handlers
const openEditCategoryForm = (category: ApiCategoryFull) => {
  categoriesStore.selectCategory(category);
  categoriesStore.clearUpdateError();
  categoriesStore.clearDeleteError();
};

const closeEditCategoryForm = () => {
  categoriesStore.selectCategory(null);
  categoriesStore.clearUpdateError();
  categoriesStore.clearDeleteError();
};

const handleCategoryFormSave = async (payload: CategoryFormPayload) => {
  if (isEditingCategory.value && selectedCategory.value) {
    // Update existing category
    const success = await categoriesStore.updateCategory(selectedCategory.value.slug, {
      name: payload.name,
      description: payload.description,
    });

    if (success) {
      categoriesStore.selectCategory(null);
    }
  } else {
    // Create new category
    const success = await categoriesStore.createCategory({
      name: payload.name,
      description: payload.description,
    });

    if (success) {
      isCreatingCategory.value = false;
    }
  }
};

const handleDeleteCategory = async () => {
  if (!selectedCategory.value) {
    return;
  }

  const success = await categoriesStore.deleteCategory(selectedCategory.value.slug);

  if (success) {
    categoriesStore.selectCategory(null);
  }
};

const handleCategoryFormCancel = () => {
  if (isEditingCategory.value) {
    closeEditCategoryForm();
  } else {
    closeCreateCategoryForm();
  }
};

// Users panel handlers
const openUsersPanel = () => {
  isUsersPanelOpen.value = true;
};

const closeUsersPanel = () => {
  isUsersPanelOpen.value = false;
  isCreatingUser.value = false;
  usersAdminStore.selectUser(null);
  usersAdminStore.clearCreateError();
  usersAdminStore.clearUpdateError();
  usersAdminStore.clearDeleteError();
};

// User creation handlers
const openCreateUserForm = () => {
  isCreatingUser.value = true;
  usersAdminStore.clearCreateError();
};

const closeCreateUserForm = () => {
  isCreatingUser.value = false;
  usersAdminStore.clearCreateError();
};

// User editing handlers
const openEditUserForm = (user: ApiUser) => {
  usersAdminStore.selectUser(user);
  usersAdminStore.clearUpdateError();
  usersAdminStore.clearDeleteError();
};

const closeEditUserForm = () => {
  usersAdminStore.selectUser(null);
  usersAdminStore.clearUpdateError();
  usersAdminStore.clearDeleteError();
};

const handleUserFormSave = async (payload: UserFormPayload) => {
  if (isEditingUser.value && selectedUser.value) {
    // Update existing user - only include password if provided
    const updatePayload: { username: string; email: string; password?: string } = {
      username: payload.username,
      email: payload.email,
    };
    if (payload.password) {
      updatePayload.password = payload.password;
    }

    const success = await usersAdminStore.updateUser(selectedUser.value.id, updatePayload);

    if (success) {
      usersAdminStore.selectUser(null);
    }
  } else {
    // Create new user
    const success = await usersAdminStore.createUser({
      username: payload.username,
      email: payload.email,
      password: payload.password,
    });

    if (success) {
      isCreatingUser.value = false;
    }
  }
};

const handleDeleteUser = async () => {
  if (!selectedUser.value) {
    return;
  }

  const success = await usersAdminStore.deleteUser(selectedUser.value.id);

  if (success) {
    usersAdminStore.selectUser(null);
  }
};

const handleUserFormCancel = () => {
  if (isEditingUser.value) {
    closeEditUserForm();
  } else {
    closeCreateUserForm();
  }
};
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="isOpen" class="fixed inset-0 z-60">
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/50 transition-opacity" @click="handleOverlayClick" />

        <!-- Second-Level Posts Panel -->
        <Transition name="posts-panel">
          <div
            v-if="isPostsPanelOpen"
            class="absolute top-0 right-80 left-0 h-full bg-white shadow-xl"
          >
            <!-- Posts Panel Header -->
            <div class="p-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900">
                  {{
                    isEditingPost
                      ? 'Beitrag bearbeiten'
                      : isCreatingPost
                        ? 'Neuer Beitrag'
                        : 'Beiträge'
                  }}
                </h2>
                <div class="flex items-center gap-2">
                  <!-- Delete Button (only show when editing) -->
                  <button
                    v-if="isEditingPost"
                    type="button"
                    :disabled="postFormLoading"
                    class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Beitrag loschen"
                    @click="handleDeletePost"
                  >
                    <svg
                      v-if="deleting"
                      class="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <svg
                      v-else
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                  <!-- New Post Button (only show when viewing list) -->
                  <button
                    v-if="!isShowingPostForm"
                    type="button"
                    class="px-3 py-1.5 text-sm bg-[#00295e] text-white hover:bg-[#003d8a] rounded-lg transition-colors flex items-center gap-1"
                    @click="openCreatePostForm"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span>Neuer Beitrag</span>
                  </button>
                  <!-- Close Button -->
                  <button
                    type="button"
                    class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Panel schliessen"
                    @click="closePostsPanel"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Posts Panel Content -->
            <div class="flex flex-col h-[calc(100%-65px)]">
              <!-- Post Creation/Edit Form -->
              <div v-if="isShowingPostForm" class="flex-1 overflow-auto">
                <VsgPostForm
                  :loading="postFormLoading"
                  :error="postFormError"
                  :initial-data="
                    selectedPost
                      ? {
                          title: selectedPost.title,
                          content: selectedPost.content,
                          published: selectedPost.published,
                        }
                      : null
                  "
                  @save="handlePostFormSave"
                  @cancel="handlePostFormCancel"
                />
              </div>

              <!-- Posts List View -->
              <template v-else>
                <!-- Filter Controls -->
                <div class="p-4 border-b border-gray-200 space-y-3">
                  <div class="flex flex-wrap gap-3">
                    <!-- Published Status Filter -->
                    <div class="flex-1 min-w-[140px]">
                      <label
                        for="published-filter"
                        class="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Status
                      </label>
                      <select
                        id="published-filter"
                        :value="publishedFilter"
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00295e] focus:border-transparent"
                        @change="handlePublishedFilterChange"
                      >
                        <option value="all">Alle</option>
                        <option value="published">Veröffentlicht</option>
                        <option value="unpublished">Entwurf</option>
                      </select>
                    </div>

                    <!-- Category Filter -->
                    <div class="flex-1 min-w-[140px]">
                      <label
                        for="category-filter"
                        class="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Kategorie
                      </label>
                      <input
                        id="category-filter"
                        type="text"
                        :value="categoryFilter"
                        placeholder="Kategorie..."
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00295e] focus:border-transparent"
                        @change="handleCategoryFilterChange"
                      />
                    </div>

                    <!-- Tag Filter -->
                    <div class="flex-1 min-w-[140px]">
                      <label for="tag-filter" class="block text-xs font-medium text-gray-700 mb-1">
                        Tag
                      </label>
                      <input
                        id="tag-filter"
                        type="text"
                        :value="tagFilter"
                        placeholder="Tag..."
                        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00295e] focus:border-transparent"
                        @change="handleTagFilterChange"
                      />
                    </div>
                  </div>

                  <!-- Clear Filters Button -->
                  <button
                    v-if="postsStore.hasFilters()"
                    type="button"
                    class="text-sm text-[#00295e] hover:underline"
                    @click="postsStore.clearFilters()"
                  >
                    Filter zurücksetzen
                  </button>
                </div>

                <!-- Posts Table -->
                <div class="flex-1 overflow-auto p-4">
                  <!-- Loading State -->
                  <div v-if="loading" class="flex items-center justify-center h-32">
                    <div class="flex items-center gap-2 text-gray-500">
                      <svg
                        class="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                        ></circle>
                        <path
                          class="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Lade Beiträge...</span>
                    </div>
                  </div>

                  <!-- Error State -->
                  <div v-else-if="error" class="flex items-center justify-center h-32">
                    <div class="text-center">
                      <p class="text-red-600 mb-2">{{ error }}</p>
                      <button
                        type="button"
                        class="text-sm text-[#00295e] hover:underline"
                        @click="postsStore.fetchPosts()"
                      >
                        Erneut versuchen
                      </button>
                    </div>
                  </div>

                  <!-- Empty State -->
                  <div v-else-if="posts.length === 0" class="flex items-center justify-center h-32">
                    <p class="text-gray-500">Keine Beiträge gefunden.</p>
                  </div>

                  <!-- Posts Table -->
                  <table v-else class="w-full text-sm">
                    <thead>
                      <tr class="border-b border-gray-200">
                        <th class="text-left py-2 px-2 font-medium text-gray-700">Titel</th>
                        <th class="text-left py-2 px-2 font-medium text-gray-700 w-24">Status</th>
                        <th class="text-left py-2 px-2 font-medium text-gray-700 w-28">
                          Kategorie
                        </th>
                        <th class="text-left py-2 px-2 font-medium text-gray-700 w-24">Datum</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="post in posts"
                        :key="post.id"
                        class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        @click="openEditPostForm(post)"
                      >
                        <td class="py-2 px-2">
                          <span class="font-medium text-gray-900 line-clamp-1">{{
                            post.title
                          }}</span>
                        </td>
                        <td class="py-2 px-2">
                          <span
                            :class="[
                              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                              post.published
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800',
                            ]"
                          >
                            {{ post.published ? 'Live' : 'Entwurf' }}
                          </span>
                        </td>
                        <td class="py-2 px-2">
                          <span class="text-gray-600 line-clamp-1">
                            {{ post.categories?.[0]?.name ?? '-' }}
                          </span>
                        </td>
                        <td class="py-2 px-2 text-gray-600">
                          {{ formatDate(post.createdAt) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Pagination Controls -->
                <div
                  v-if="!loading && !error && posts.length > 0"
                  class="p-4 border-t border-gray-200"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">
                      Seite {{ meta.page }} von {{ meta.totalPages }}
                    </span>
                    <div class="flex gap-2">
                      <button
                        type="button"
                        :disabled="!postsStore.canGoPrevious()"
                        class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        @click="postsStore.previousPage()"
                      >
                        Zurück
                      </button>
                      <button
                        type="button"
                        :disabled="!postsStore.canGoNext()"
                        class="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        @click="postsStore.nextPage()"
                      >
                        Weiter
                      </button>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </Transition>

        <!-- Second-Level Departments Panel -->
        <Transition name="departments-panel">
          <div
            v-if="isDepartmentsPanelOpen"
            class="absolute top-0 right-80 left-0 h-full bg-white shadow-xl"
          >
            <!-- Departments Panel Header -->
            <div class="p-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900">
                  {{
                    isEditingDepartment
                      ? 'Abteilung bearbeiten'
                      : isCreatingDepartment
                        ? 'Neue Abteilung'
                        : 'Abteilungen'
                  }}
                </h2>
                <div class="flex items-center gap-2">
                  <!-- Delete Button (only show when editing) -->
                  <button
                    v-if="isEditingDepartment"
                    type="button"
                    :disabled="departmentFormLoading"
                    class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Abteilung loschen"
                    @click="handleDeleteDepartment"
                  >
                    <svg
                      v-if="departmentsDeleting"
                      class="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <svg
                      v-else
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                  <!-- New Department Button (only show when viewing list) -->
                  <button
                    v-if="!isShowingDepartmentForm"
                    type="button"
                    class="px-3 py-1.5 text-sm bg-[#00295e] text-white hover:bg-[#003d8a] rounded-lg transition-colors flex items-center gap-1"
                    @click="openCreateDepartmentForm"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span>Neue Abteilung</span>
                  </button>
                  <!-- Close Button -->
                  <button
                    type="button"
                    class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Panel schliessen"
                    @click="closeDepartmentsPanel"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Departments Panel Content -->
            <div class="flex flex-col h-[calc(100%-65px)]">
              <!-- Department Creation/Edit Form -->
              <div v-if="isShowingDepartmentForm" class="flex-1 overflow-auto">
                <VsgDepartmentForm
                  :loading="departmentFormLoading"
                  :error="departmentFormError"
                  :initial-data="
                    selectedDepartment
                      ? {
                          name: selectedDepartment.name,
                          shortDescription: selectedDepartment.shortDescription,
                          longDescription: selectedDepartment.longDescription,
                        }
                      : null
                  "
                  @save="handleDepartmentFormSave"
                  @cancel="handleDepartmentFormCancel"
                />
              </div>

              <!-- Departments List View -->
              <template v-else>
                <!-- Departments Table -->
                <div class="flex-1 overflow-auto p-4">
                  <!-- Loading State -->
                  <div v-if="departmentsLoading" class="flex items-center justify-center h-32">
                    <div class="flex items-center gap-2 text-gray-500">
                      <svg
                        class="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                        ></circle>
                        <path
                          class="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Lade Abteilungen...</span>
                    </div>
                  </div>

                  <!-- Error State -->
                  <div v-else-if="departmentsError" class="flex items-center justify-center h-32">
                    <div class="text-center">
                      <p class="text-red-600 mb-2">{{ departmentsError }}</p>
                      <button
                        type="button"
                        class="text-sm text-[#00295e] hover:underline"
                        @click="departmentsStore.fetchDepartments()"
                      >
                        Erneut versuchen
                      </button>
                    </div>
                  </div>

                  <!-- Empty State -->
                  <div
                    v-else-if="departments.length === 0"
                    class="flex items-center justify-center h-32"
                  >
                    <p class="text-gray-500">Keine Abteilungen gefunden.</p>
                  </div>

                  <!-- Departments Table -->
                  <table v-else class="w-full text-sm">
                    <thead>
                      <tr class="border-b border-gray-200">
                        <th class="text-left py-2 px-2 font-medium text-gray-700">Name</th>
                        <th class="text-left py-2 px-2 font-medium text-gray-700">
                          Kurzbeschreibung
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="department in departments"
                        :key="department.id"
                        class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        @click="openEditDepartmentForm(department)"
                      >
                        <td class="py-2 px-2">
                          <span class="font-medium text-gray-900 line-clamp-1">{{
                            department.name
                          }}</span>
                        </td>
                        <td class="py-2 px-2">
                          <span class="text-gray-600 line-clamp-1">
                            {{ department.shortDescription }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>
            </div>
          </div>
        </Transition>

        <!-- Second-Level Categories Panel -->
        <Transition name="categories-panel">
          <div
            v-if="isCategoriesPanelOpen"
            class="absolute top-0 right-80 left-0 h-full bg-white shadow-xl"
          >
            <!-- Categories Panel Header -->
            <div class="p-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900">
                  {{
                    isEditingCategory
                      ? 'Kategorie bearbeiten'
                      : isCreatingCategory
                        ? 'Neue Kategorie'
                        : 'Kategorien'
                  }}
                </h2>
                <div class="flex items-center gap-2">
                  <!-- Delete Button (only show when editing) -->
                  <button
                    v-if="isEditingCategory"
                    type="button"
                    :disabled="categoryFormLoading"
                    class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Kategorie loschen"
                    @click="handleDeleteCategory"
                  >
                    <svg
                      v-if="categoriesDeleting"
                      class="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <svg
                      v-else
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                  <!-- New Category Button (only show when viewing list) -->
                  <button
                    v-if="!isShowingCategoryForm"
                    type="button"
                    class="px-3 py-1.5 text-sm bg-[#00295e] text-white hover:bg-[#003d8a] rounded-lg transition-colors flex items-center gap-1"
                    @click="openCreateCategoryForm"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span>Neue Kategorie</span>
                  </button>
                  <!-- Close Button -->
                  <button
                    type="button"
                    class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Panel schliessen"
                    @click="closeCategoriesPanel"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Categories Panel Content -->
            <div class="flex flex-col h-[calc(100%-65px)]">
              <!-- Category Creation/Edit Form -->
              <div v-if="isShowingCategoryForm" class="flex-1 overflow-auto">
                <VsgCategoryForm
                  :loading="categoryFormLoading"
                  :error="categoryFormError"
                  :initial-data="
                    selectedCategory
                      ? {
                          name: selectedCategory.name,
                          description: selectedCategory.description,
                        }
                      : null
                  "
                  @save="handleCategoryFormSave"
                  @cancel="handleCategoryFormCancel"
                />
              </div>

              <!-- Categories List View -->
              <template v-else>
                <!-- Categories Table -->
                <div class="flex-1 overflow-auto p-4">
                  <!-- Loading State -->
                  <div v-if="categoriesLoading" class="flex items-center justify-center h-32">
                    <div class="flex items-center gap-2 text-gray-500">
                      <svg
                        class="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                        ></circle>
                        <path
                          class="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Lade Kategorien...</span>
                    </div>
                  </div>

                  <!-- Error State -->
                  <div v-else-if="categoriesError" class="flex items-center justify-center h-32">
                    <div class="text-center">
                      <p class="text-red-600 mb-2">{{ categoriesError }}</p>
                      <button
                        type="button"
                        class="text-sm text-[#00295e] hover:underline"
                        @click="categoriesStore.fetchCategories()"
                      >
                        Erneut versuchen
                      </button>
                    </div>
                  </div>

                  <!-- Empty State -->
                  <div
                    v-else-if="categories.length === 0"
                    class="flex items-center justify-center h-32"
                  >
                    <p class="text-gray-500">Keine Kategorien gefunden.</p>
                  </div>

                  <!-- Categories Table -->
                  <table v-else class="w-full text-sm">
                    <thead>
                      <tr class="border-b border-gray-200">
                        <th class="text-left py-2 px-2 font-medium text-gray-700">Name</th>
                        <th class="text-left py-2 px-2 font-medium text-gray-700">Beschreibung</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="category in categories"
                        :key="category.id"
                        class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        @click="openEditCategoryForm(category)"
                      >
                        <td class="py-2 px-2">
                          <span class="font-medium text-gray-900 line-clamp-1">{{
                            category.name
                          }}</span>
                        </td>
                        <td class="py-2 px-2">
                          <span class="text-gray-600 line-clamp-1">
                            {{ category.description || '-' }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>
            </div>
          </div>
        </Transition>

        <!-- Second-Level Users Panel -->
        <Transition name="users-panel">
          <div
            v-if="isUsersPanelOpen"
            class="absolute top-0 right-80 left-0 h-full bg-white shadow-xl"
          >
            <!-- Users Panel Header -->
            <div class="p-4 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900">
                  {{
                    isEditingUser
                      ? 'Benutzer bearbeiten'
                      : isCreatingUser
                        ? 'Neuer Benutzer'
                        : 'Benutzer'
                  }}
                </h2>
                <div class="flex items-center gap-2">
                  <!-- Delete Button (only show when editing) -->
                  <button
                    v-if="isEditingUser"
                    type="button"
                    :disabled="userFormLoading"
                    class="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Benutzer loschen"
                    @click="handleDeleteUser"
                  >
                    <svg
                      v-if="usersDeleting"
                      class="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <svg
                      v-else
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                  <!-- New User Button (only show when viewing list) -->
                  <button
                    v-if="!isShowingUserForm"
                    type="button"
                    class="px-3 py-1.5 text-sm bg-[#00295e] text-white hover:bg-[#003d8a] rounded-lg transition-colors flex items-center gap-1"
                    @click="openCreateUserForm"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span>Neuer Benutzer</span>
                  </button>
                  <!-- Close Button -->
                  <button
                    type="button"
                    class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Panel schliessen"
                    @click="closeUsersPanel"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Users Panel Content -->
            <div class="flex flex-col h-[calc(100%-65px)]">
              <!-- User Creation/Edit Form -->
              <div v-if="isShowingUserForm" class="flex-1 overflow-auto">
                <VsgUserForm
                  :loading="userFormLoading"
                  :error="userFormError"
                  :initial-data="
                    selectedUser
                      ? {
                          username: selectedUser.username,
                          email: selectedUser.email,
                        }
                      : null
                  "
                  @save="handleUserFormSave"
                  @cancel="handleUserFormCancel"
                />
              </div>

              <!-- Users List View -->
              <template v-else>
                <!-- Users Table -->
                <div class="flex-1 overflow-auto p-4">
                  <!-- Loading State -->
                  <div v-if="usersLoading" class="flex items-center justify-center h-32">
                    <div class="flex items-center gap-2 text-gray-500">
                      <svg
                        class="animate-spin h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          class="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          stroke-width="4"
                        ></circle>
                        <path
                          class="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Lade Benutzer...</span>
                    </div>
                  </div>

                  <!-- Error State -->
                  <div v-else-if="usersError" class="flex items-center justify-center h-32">
                    <div class="text-center">
                      <p class="text-red-600 mb-2">{{ usersError }}</p>
                      <button
                        type="button"
                        class="text-sm text-[#00295e] hover:underline"
                        @click="usersAdminStore.fetchUsers()"
                      >
                        Erneut versuchen
                      </button>
                    </div>
                  </div>

                  <!-- Empty State -->
                  <div
                    v-else-if="users.length === 0"
                    class="flex items-center justify-center h-32"
                  >
                    <p class="text-gray-500">Keine Benutzer gefunden.</p>
                  </div>

                  <!-- Users Table -->
                  <table v-else class="w-full text-sm">
                    <thead>
                      <tr class="border-b border-gray-200">
                        <th class="text-left py-2 px-2 font-medium text-gray-700">Benutzername</th>
                        <th class="text-left py-2 px-2 font-medium text-gray-700">E-Mail</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="user in users"
                        :key="user.id"
                        class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                        @click="openEditUserForm(user)"
                      >
                        <td class="py-2 px-2">
                          <span class="font-medium text-gray-900 line-clamp-1">{{
                            user.username
                          }}</span>
                        </td>
                        <td class="py-2 px-2">
                          <span class="text-gray-600 line-clamp-1">
                            {{ user.email }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>
            </div>
          </div>
        </Transition>

        <!-- Drawer Panel -->
        <div
          class="absolute top-0 right-0 h-full w-80 max-w-full bg-white shadow-xl transform transition-transform"
        >
          <!-- Header -->
          <div class="p-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">Schnellzugriff</h2>
              <button
                type="button"
                class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Drawer schliessen"
                @click="handleCloseClick"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <p class="mt-2 text-sm text-gray-600">
              Eingeloggt als <span class="font-semibold text-gray-900">{{ username }}</span>
            </p>
          </div>

          <!-- Content -->
          <nav class="p-4">
            <!-- Beiträge Action Button -->
            <button
              type="button"
              class="w-full mb-2 px-4 py-3 bg-[#00295e] text-white hover:bg-[#003d8a] rounded-lg transition-colors font-medium text-left flex items-center justify-between"
              @click="openPostsPanel"
            >
              <span>Beiträge</span>
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            <!-- Abteilungen Action Button -->
            <button
              type="button"
              class="w-full mb-2 px-4 py-3 bg-[#00295e] text-white hover:bg-[#003d8a] rounded-lg transition-colors font-medium text-left flex items-center justify-between"
              @click="openDepartmentsPanel"
            >
              <span>Abteilungen</span>
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            <!-- Kategorien Action Button -->
            <button
              type="button"
              class="w-full mb-2 px-4 py-3 bg-[#00295e] text-white hover:bg-[#003d8a] rounded-lg transition-colors font-medium text-left flex items-center justify-between"
              @click="openCategoriesPanel"
            >
              <span>Kategorien</span>
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            <!-- Benutzer Action Button -->
            <button
              type="button"
              class="w-full mb-4 px-4 py-3 bg-[#00295e] text-white hover:bg-[#003d8a] rounded-lg transition-colors font-medium text-left flex items-center justify-between"
              @click="openUsersPanel"
            >
              <span>Benutzer</span>
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            <ul class="space-y-1">
              <li v-for="link in quickLinks" :key="link.path">
                <a
                  :href="link.path"
                  class="block px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-[#00295e] rounded-lg transition-colors"
                >
                  {{ link.label }}
                </a>
              </li>
            </ul>
          </nav>

          <!-- Footer with Logout -->
          <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <button
              type="button"
              class="w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              @click="handleLogoutClick"
            >
              Abmelden
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.3s ease;
}

.drawer-enter-active > div:last-child,
.drawer-leave-active > div:last-child {
  transition: transform 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from > div:last-child,
.drawer-leave-to > div:last-child {
  transform: translateX(100%);
}

/* Posts Panel Transitions */
.posts-panel-enter-active,
.posts-panel-leave-active {
  transition: transform 0.3s ease;
}

.posts-panel-enter-from,
.posts-panel-leave-to {
  transform: translateX(-100%);
}

/* Departments Panel Transitions */
.departments-panel-enter-active,
.departments-panel-leave-active {
  transition: transform 0.3s ease;
}

.departments-panel-enter-from,
.departments-panel-leave-to {
  transform: translateX(-100%);
}

/* Categories Panel Transitions */
.categories-panel-enter-active,
.categories-panel-leave-active {
  transition: transform 0.3s ease;
}

.categories-panel-enter-from,
.categories-panel-leave-to {
  transform: translateX(-100%);
}

/* Users Panel Transitions */
.users-panel-enter-active,
.users-panel-leave-active {
  transition: transform 0.3s ease;
}

.users-panel-enter-from,
.users-panel-leave-to {
  transform: translateX(-100%);
}
</style>
