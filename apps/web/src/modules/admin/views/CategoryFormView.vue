<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useCategoriesStore, type Category } from '../stores/categoriesStore';
import CategoryForm from '../components/CategoryForm.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const route = useRoute();
const categoriesStore = useCategoriesStore();

const category = ref<Category | null>(null);
const isLoading = ref(false);

const isEditMode = computed(() => !!route.params.slug);
const pageTitle = computed(() => (isEditMode.value ? 'KATEGORIE BEARBEITEN' : 'KATEGORIE ERSTELLEN'));
const pageSubtitle = computed(() => (isEditMode.value ? 'Bearbeite die Kategoriedaten' : 'Erstelle eine neue Kategorie'));
const breadcrumbAction = computed(() => (isEditMode.value ? 'Bearbeiten' : 'Erstellen'));

onMounted(async () => {
  if (isEditMode.value) {
    isLoading.value = true;
    // Handle slug as array (Vue Router repeatable params) and join with '/'
    const slugParam = route.params.slug;
    const slug = Array.isArray(slugParam) ? slugParam.join('/') : slugParam;
    category.value = await categoriesStore.fetchCategory(slug);
    isLoading.value = false;
  }
});
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center gap-2 text-sm font-body font-normal text-gray-500 mb-2">
        <router-link
          to="/admin/kategorien"
          class="hover:text-vsg-blue-600 transition-colors"
        >
          Kategorien
        </router-link>
        <FontAwesomeIcon icon="chevron-right" />
        <span class="text-vsg-blue-600">{{ breadcrumbAction }}</span>
      </div>
      <h1 class="font-display text-4xl tracking-wider text-vsg-blue-900">
        {{ pageTitle }}
      </h1>
      <p class="font-body font-normal text-vsg-blue-600 mt-1">
        {{ pageSubtitle }}
      </p>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="flex items-center justify-center py-12"
    >
      <div class="text-vsg-blue-600 font-body">Laden...</div>
    </div>

    <!-- Form -->
    <CategoryForm
      v-else
      :category="category"
      :is-edit-mode="isEditMode"
    />
  </div>
</template>
