<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useCategoriesStore, type Category } from '../stores/categoriesStore';
import CategoryForm from '../components/CategoryForm.vue';

const route = useRoute();
const categoriesStore = useCategoriesStore();

const category = ref<Category | null>(null);
const isLoading = ref(false);

const isEditMode = computed(() => !!route.params.slug);
const pageTitle = computed(() =>
  isEditMode.value ? 'KATEGORIE BEARBEITEN' : 'KATEGORIE ERSTELLEN',
);
const pageSubtitle = computed(() =>
  isEditMode.value
    ? 'Bearbeite die Kategoriedaten'
    : 'Erstelle eine neue Kategorie',
);
const breadcrumbAction = computed(() =>
  isEditMode.value ? 'Bearbeiten' : 'Erstellen',
);

onMounted(async () => {
  if (isEditMode.value) {
    isLoading.value = true;
    const slug = route.params.slug as string;
    category.value = await categoriesStore.fetchCategory(slug);
    isLoading.value = false;
  }
});
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <div
        class="flex items-center gap-2 text-sm font-body font-extralight text-gray-500 mb-2"
      >
        <router-link
          to="/admin/categories"
          class="hover:text-vsg-blue-600 transition-colors"
        >
          Kategorien
        </router-link>
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span class="text-vsg-blue-600">{{ breadcrumbAction }}</span>
      </div>
      <h1 class="font-display text-4xl tracking-wider text-vsg-blue-900">
        {{ pageTitle }}
      </h1>
      <p class="font-body font-extralight text-vsg-blue-600 mt-1">
        {{ pageSubtitle }}
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-vsg-blue-600 font-body">Laden...</div>
    </div>

    <!-- Form -->
    <CategoryForm v-else :category="category" :is-edit-mode="isEditMode" />
  </div>
</template>
