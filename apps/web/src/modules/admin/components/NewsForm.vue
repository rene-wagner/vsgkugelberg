<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  useNewsStore,
  type NewsItem,
  type CreateNewsData,
  type UpdateNewsData,
} from '../stores/newsStore';
import { useCategoriesStore } from '../stores/categoriesStore';
import { useTagsStore } from '../stores/tagsStore';
import { useAuthStore } from '@/modules/auth/stores/authStore';

const props = defineProps<{
  newsItem: NewsItem | null;
  isEditMode: boolean;
}>();

const router = useRouter();
const newsStore = useNewsStore();
const categoriesStore = useCategoriesStore();
const tagsStore = useTagsStore();
const authStore = useAuthStore();

const title = ref('');
const content = ref('');
const published = ref(false);
const selectedCategoryIds = ref<number[]>([]);
const selectedTagIds = ref<number[]>([]);
const error = ref('');
const isSubmitting = ref(false);

// Load categories and tags on mount
onMounted(async () => {
  await Promise.all([categoriesStore.fetchCategories(), tagsStore.fetchTags()]);
});

// Watch for newsItem prop changes to populate form
watch(
  () => props.newsItem,
  (newNewsItem) => {
    if (newNewsItem) {
      title.value = newNewsItem.title;
      content.value = newNewsItem.content || '';
      published.value = newNewsItem.published;
      selectedCategoryIds.value = newNewsItem.categories.map((c) => c.id);
      selectedTagIds.value = newNewsItem.tags.map((t) => t.id);
    }
  },
  { immediate: true },
);

const canSubmit = computed(() => {
  return title.value.trim() !== '';
});

const authorName = computed(() => {
  if (props.isEditMode && props.newsItem) {
    return props.newsItem.author.username;
  }
  return authStore.user?.username || 'Unbekannt';
});

const authorId = computed(() => {
  if (props.isEditMode && props.newsItem) {
    return props.newsItem.authorId;
  }
  return authStore.user?.id;
});

async function handleSubmit() {
  if (!canSubmit.value) return;

  error.value = '';
  isSubmitting.value = true;

  try {
    if (props.isEditMode && props.newsItem) {
      // Update existing news item
      const updateData: UpdateNewsData = {
        title: title.value,
        content: content.value || undefined,
        published: published.value,
        categoryIds: selectedCategoryIds.value,
        tagIds: selectedTagIds.value,
      };

      const result = await newsStore.updateNews(
        props.newsItem.slug,
        updateData,
      );
      if (result) {
        router.push('/admin/news');
      } else {
        error.value =
          newsStore.error || 'Fehler beim Aktualisieren des Artikels';
      }
    } else {
      // Create new news item
      if (!authorId.value) {
        error.value = 'Kein Benutzer angemeldet';
        return;
      }

      const createData: CreateNewsData = {
        title: title.value,
        content: content.value || undefined,
        published: published.value,
        authorId: authorId.value,
        categoryIds: selectedCategoryIds.value,
        tagIds: selectedTagIds.value,
      };

      const result = await newsStore.createNews(createData);
      if (result) {
        router.push('/admin/news');
      } else {
        error.value = newsStore.error || 'Fehler beim Erstellen des Artikels';
      }
    }
  } catch {
    error.value = 'Ein unerwarteter Fehler ist aufgetreten';
  } finally {
    isSubmitting.value = false;
  }
}

async function handleDelete() {
  if (!props.newsItem) return;

  const confirmed = window.confirm(
    `Mochtest du den Artikel "${props.newsItem.title}" wirklich löschen?`,
  );
  if (!confirmed) return;

  isSubmitting.value = true;
  const success = await newsStore.deleteNews(props.newsItem.slug);
  isSubmitting.value = false;

  if (success) {
    router.push('/admin/news');
  } else {
    error.value = newsStore.error || 'Fehler beim löschen des Artikels';
  }
}

function handleCancel() {
  router.push('/admin/news');
}

function toggleCategory(categoryId: number) {
  const index = selectedCategoryIds.value.indexOf(categoryId);
  if (index === -1) {
    selectedCategoryIds.value.push(categoryId);
  } else {
    selectedCategoryIds.value.splice(index, 1);
  }
}

function toggleTag(tagId: number) {
  const index = selectedTagIds.value.indexOf(tagId);
  if (index === -1) {
    selectedTagIds.value.push(tagId);
  } else {
    selectedTagIds.value.splice(index, 1);
  }
}
</script>

<template>
  <form class="max-w-3xl" @submit.prevent="handleSubmit">
    <!-- Error Message -->
    <div
      v-if="error"
      class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
    >
      <p class="text-sm text-red-600 font-body">{{ error }}</p>
    </div>

    <!-- Article Data Section -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6">
        ARTIKELDATEN
      </h2>

      <div class="space-y-6">
        <!-- Title -->
        <div>
          <label
            for="title"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Titel <span class="text-red-500">*</span>
          </label>
          <input
            id="title"
            v-model="title"
            type="text"
            required
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
            placeholder="z.B. Badminton-Turnier erfolgreich abgeschlossen"
          />
        </div>

        <!-- Content -->
        <div>
          <label
            for="content"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Inhalt
          </label>
          <textarea
            id="content"
            v-model="content"
            rows="8"
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600 resize-none"
            placeholder="Artikelinhalt..."
          ></textarea>
        </div>

        <!-- Author (read-only display) -->
        <div>
          <label
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Autor
          </label>
          <div
            class="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-vsg-blue-900 text-sm"
          >
            {{ authorName }}
          </div>
        </div>

        <!-- Published -->
        <div class="flex items-center gap-3">
          <input
            id="published"
            v-model="published"
            type="checkbox"
            class="w-5 h-5 rounded border-gray-300 text-vsg-blue-600 focus:ring-vsg-blue-500"
          />
          <label
            for="published"
            class="font-body font-normal text-sm text-vsg-blue-900"
          >
            Artikel veroffentlichen
          </label>
        </div>
      </div>
    </div>

    <!-- Categories Section -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6">
        KATEGORIEN
      </h2>

      <div
        v-if="categoriesStore.isLoading"
        class="text-vsg-blue-600 font-body text-sm"
      >
        Laden...
      </div>
      <div
        v-else-if="categoriesStore.categories.length === 0"
        class="text-gray-500 font-body text-sm"
      >
        Keine Kategorien vorhanden
      </div>
      <div v-else class="space-y-3">
        <div
          v-for="category in categoriesStore.categories"
          :key="category.id"
          class="flex items-center gap-3"
        >
          <input
            :id="`category-${category.id}`"
            type="checkbox"
            :checked="selectedCategoryIds.includes(category.id)"
            class="w-5 h-5 rounded border-gray-300 text-vsg-blue-600 focus:ring-vsg-blue-500"
            @change="toggleCategory(category.id)"
          />
          <label
            :for="`category-${category.id}`"
            class="font-body font-normal text-sm text-vsg-blue-900 cursor-pointer"
          >
            {{ category.name }}
          </label>
        </div>
      </div>
    </div>

    <!-- Tags Section -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6">
        TAGS
      </h2>

      <div
        v-if="tagsStore.isLoading"
        class="text-vsg-blue-600 font-body text-sm"
      >
        Laden...
      </div>
      <div
        v-else-if="tagsStore.tags.length === 0"
        class="text-gray-500 font-body text-sm"
      >
        Keine Tags vorhanden
      </div>
      <div v-else class="flex flex-wrap gap-4">
        <div
          v-for="tag in tagsStore.tags"
          :key="tag.id"
          class="flex items-center gap-2"
        >
          <input
            :id="`tag-${tag.id}`"
            type="checkbox"
            :checked="selectedTagIds.includes(tag.id)"
            class="w-5 h-5 rounded border-gray-300 text-vsg-blue-600 focus:ring-vsg-blue-500"
            @change="toggleTag(tag.id)"
          />
          <label
            :for="`tag-${tag.id}`"
            class="font-body font-normal text-sm text-vsg-blue-900 cursor-pointer"
          >
            {{ tag.name }}
          </label>
        </div>
      </div>
    </div>

    <!-- Form Actions -->
    <div
      class="flex items-center justify-between border-t border-gray-200 pt-6"
    >
      <button
        type="button"
        class="px-6 py-2.5 border border-gray-300 text-gray-600 font-body text-sm rounded-lg hover:bg-gray-50 transition-colors"
        @click="handleCancel"
      >
        Abbrechen
      </button>

      <div class="flex items-center gap-3">
        <button
          v-if="isEditMode"
          type="button"
          class="px-6 py-2.5 border border-red-300 text-red-600 font-body text-sm rounded-lg hover:bg-red-50 transition-colors"
          :disabled="isSubmitting"
          @click="handleDelete"
        >
          Artikel löschen
        </button>
        <button
          type="submit"
          class="px-8 py-2.5 bg-vsg-blue-600 text-white font-display text-sm tracking-wider rounded-lg hover:bg-vsg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!canSubmit || isSubmitting"
        >
          {{ isSubmitting ? 'SPEICHERN...' : 'SPEICHERN' }}
        </button>
      </div>
    </div>
  </form>
</template>
