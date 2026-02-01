<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useCategoriesStore, type Category } from '../stores/categoriesStore';
import CategoryForm from '../components/forms/CategoryForm.vue';
import AdminPageHeader from '../components/AdminPageHeader.vue';
import AdminLoadingState from '../components/AdminLoadingState.vue';

const route = useRoute();
const categoriesStore = useCategoriesStore();

const category = ref<Category | null>(null);
const isLoading = ref(false);

const isEditMode = computed(() => !!route.params.slug);
const pageTitle = computed(() => (isEditMode.value ? 'KATEGORIE BEARBEITEN' : 'KATEGORIE ERSTELLEN'));
const pageSubtitle = computed(() => (isEditMode.value ? 'Bearbeite die Kategoriedaten' : 'Erstelle eine neue Kategorie'));

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
    <AdminPageHeader
      :title="pageTitle"
      :description="pageSubtitle"
    />

    <!-- Loading State -->
    <AdminLoadingState v-if="isLoading" />

    <!-- Form -->
    <CategoryForm
      v-else
      :category="category"
      :is-edit-mode="isEditMode"
    />
  </div>
</template>
