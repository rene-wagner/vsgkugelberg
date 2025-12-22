<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  useCategoriesStore,
  type Category,
  type CreateCategoryData,
  type UpdateCategoryData,
} from '../stores/categoriesStore';
import VsgTreeSelect from '@/shared/components/VsgTreeSelect.vue';

const props = defineProps<{
  category: Category | null;
  isEditMode: boolean;
}>();

const router = useRouter();
const categoriesStore = useCategoriesStore();

const name = ref('');
const description = ref('');
const selectedParentId = ref<number | null>(null);
const error = ref('');
const isSubmitting = ref(false);

// Fetch categories on mount for parent selection
onMounted(async () => {
  await categoriesStore.fetchCategories();
});

// Helper to collect all descendant IDs of a category
function getDescendantIds(category: Category): number[] {
  const ids: number[] = [category.id];
  if (category.children) {
    for (const child of category.children) {
      ids.push(...getDescendantIds(child));
    }
  }
  return ids;
}

// Filter out current category and its descendants to prevent circular references
function filterCategories(
  categories: Category[],
  excludeIds: Set<number>,
): Category[] {
  return categories
    .filter((cat) => !excludeIds.has(cat.id))
    .map((cat) => ({
      ...cat,
      children: cat.children ? filterCategories(cat.children, excludeIds) : [],
    }));
}

// Computed available parent categories (excludes self and descendants in edit mode)
const availableParentCategories = computed(() => {
  if (!props.isEditMode || !props.category) {
    return categoriesStore.categories;
  }

  const excludeIds = new Set(getDescendantIds(props.category));
  return filterCategories(categoriesStore.categories, excludeIds);
});

// Watch for category prop changes to populate form
watch(
  () => props.category,
  (newCategory) => {
    if (newCategory) {
      name.value = newCategory.name;
      description.value = newCategory.description || '';
      selectedParentId.value = newCategory.parentId;
    }
  },
  { immediate: true },
);

const canSubmit = computed(() => {
  return name.value.trim() !== '';
});

async function handleSubmit() {
  if (!canSubmit.value) return;

  error.value = '';
  isSubmitting.value = true;

  try {
    if (props.isEditMode && props.category) {
      // Update existing category
      const updateData: UpdateCategoryData = {
        name: name.value,
        description: description.value || undefined,
        parentId: selectedParentId.value,
      };

      const result = await categoriesStore.updateCategory(
        props.category.slug,
        updateData,
      );
      if (result) {
        router.push('/admin/categories');
      } else {
        error.value =
          categoriesStore.error || 'Fehler beim Aktualisieren der Kategorie';
      }
    } else {
      // Create new category
      const createData: CreateCategoryData = {
        name: name.value,
        description: description.value || undefined,
        parentId: selectedParentId.value || undefined,
      };

      const result = await categoriesStore.createCategory(createData);
      if (result) {
        router.push('/admin/categories');
      } else {
        error.value =
          categoriesStore.error || 'Fehler beim Erstellen der Kategorie';
      }
    }
  } catch {
    error.value = 'Ein unerwarteter Fehler ist aufgetreten';
  } finally {
    isSubmitting.value = false;
  }
}

async function handleDelete() {
  if (!props.category) return;

  const confirmed = window.confirm(
    `Mochtest du die Kategorie "${props.category.name}" wirklich löschen?`,
  );
  if (!confirmed) return;

  isSubmitting.value = true;
  const success = await categoriesStore.deleteCategory(props.category.slug);
  isSubmitting.value = false;

  if (success) {
    router.push('/admin/categories');
  } else {
    error.value = categoriesStore.error || 'Fehler beim löschen der Kategorie';
  }
}

function handleCancel() {
  router.push('/admin/categories');
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

    <!-- Category Data Section -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6">
        KATEGORIEDATEN
      </h2>

      <div class="space-y-6">
        <!-- Name -->
        <div>
          <label
            for="name"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Name <span class="text-red-500">*</span>
          </label>
          <input
            id="name"
            v-model="name"
            type="text"
            required
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
            placeholder="z.B. Vereinsnachrichten"
          />
        </div>

        <!-- Description -->
        <div>
          <label
            for="description"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Beschreibung
          </label>
          <textarea
            id="description"
            v-model="description"
            rows="4"
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600 resize-none"
            placeholder="Optionale Beschreibung der Kategorie..."
          ></textarea>
        </div>

        <!-- Parent Category -->
        <div>
          <label
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Übergeordnete Kategorie
          </label>
          <VsgTreeSelect
            v-model="selectedParentId"
            :options="availableParentCategories"
            placeholder="Keine übergeordnete Kategorie"
            :disabled="categoriesStore.isLoading"
          />
          <p class="mt-1.5 text-xs text-gray-500 font-body">
            Optional: Wähle eine übergeordnete Kategorie, um eine Unterkategorie
            zu erstellen.
          </p>
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
          Kategorie löschen
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
