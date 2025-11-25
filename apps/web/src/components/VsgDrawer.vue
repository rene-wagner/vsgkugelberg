<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { usePostsStore, type PublishedFilter } from '@/stores/posts';

const props = defineProps<{
  isOpen: boolean;
  username: string;
}>();

const emit = defineEmits<{
  close: [];
  logout: [];
}>();

const isPostsPanelOpen = ref(false);
const postsStore = usePostsStore();

const { posts, loading, error, meta, publishedFilter, categoryFilter, tagFilter } =
  storeToRefs(postsStore);

const quickLinks = [
  { label: 'Mein Profil', path: '/profil' },
  { label: 'Einstellungen', path: '/einstellungen' },
  { label: 'Nachrichten', path: '/nachrichten' },
  { label: 'Hilfe', path: '/hilfe' },
];

// Reset posts panel when drawer closes
watch(
  () => props.isOpen,
  (isOpen) => {
    if (!isOpen) {
      isPostsPanelOpen.value = false;
    }
  }
);

// Fetch posts when panel opens
watch(isPostsPanelOpen, (isOpen) => {
  if (isOpen) {
    postsStore.fetchPosts();
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
                <h2 class="text-lg font-semibold text-gray-900">Beiträge</h2>
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

            <!-- Posts Panel Content -->
            <div class="flex flex-col h-[calc(100%-65px)]">
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
                      <th class="text-left py-2 px-2 font-medium text-gray-700 w-28">Kategorie</th>
                      <th class="text-left py-2 px-2 font-medium text-gray-700 w-24">Datum</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="post in posts"
                      :key="post.id"
                      class="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td class="py-2 px-2">
                        <span class="font-medium text-gray-900 line-clamp-1">{{ post.title }}</span>
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
              class="w-full mb-4 px-4 py-3 bg-[#00295e] text-white hover:bg-[#003d8a] rounded-lg transition-colors font-medium text-left flex items-center justify-between"
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
</style>
