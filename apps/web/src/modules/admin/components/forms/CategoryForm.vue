<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCategoriesStore, type Category, type CreateCategoryData, type UpdateCategoryData } from '../../stores/categoriesStore';
import VsgTreeSelect from '@/shared/components/VsgTreeSelect.vue';
import VsgMarkdownEditor from '@/shared/components/VsgMarkdownEditor.vue';

const props = defineProps<{
  category: Category | null;
  isEditMode: boolean;
}>();

const router = useRouter();
const categoriesStore = useCategoriesStore();

interface CategoryFormData {
  name: string;
  description: string;
  parentId: number | null;
}

const formData = ref<CategoryFormData>({
  name: '',
  description: '',
  parentId: null,
});

const error = ref('');
const isSubmitting = ref(false);

onMounted(async () => {
  await categoriesStore.fetchCategories();
});

const canSubmit = computed(() => formData.value.name.trim() !== '');

function getDescendantIds(category: Category): number[] {
  const ids: number[] = [category.id];
  if (category.children) {
    for (const child of category.children) {
      ids.push(...getDescendantIds(child));
    }
  }
  return ids;
}

function filterCategories(categories: Category[], excludeIds: Set<number>): Category[] {
  return categories
    .filter((cat) => !excludeIds.has(cat.id))
    .map((cat) => ({
      ...cat,
      children: cat.children ? filterCategories(cat.children, excludeIds) : [],
    }));
}

const availableParentCategories = computed(() => {
  if (!props.isEditMode || !props.category) {
    return categoriesStore.categories;
  }

  const excludeIds = new Set(getDescendantIds(props.category));
  return filterCategories(categoriesStore.categories, excludeIds);
});

watch(
  () => props.category,
  (newCategory) => {
    if (newCategory) {
      formData.value.name = newCategory.name;
      formData.value.description = newCategory.description || '';
      formData.value.parentId = newCategory.parentId;
    }
  },
  { immediate: true },
);

async function handleSubmit() {
  if (!canSubmit.value) return;

  error.value = '';
  isSubmitting.value = true;

  try {
    if (props.isEditMode && props.category) {
      const updateData: UpdateCategoryData = {
        name: formData.value.name,
        description: formData.value.description || undefined,
        parentId: formData.value.parentId,
      };

      const result = await categoriesStore.updateCategory(props.category.slug, updateData);
      if (result) {
        router.push('/admin/categories');
      } else {
        error.value = categoriesStore.error || 'Fehler beim Aktualisieren der Kategorie';
      }
    } else {
      const createData: CreateCategoryData = {
        name: formData.value.name,
        description: formData.value.description || undefined,
        parentId: formData.value.parentId || undefined,
      };

      const result = await categoriesStore.createCategory(createData);
      if (result) {
        router.push('/admin/categories');
      } else {
        error.value = categoriesStore.error || 'Fehler beim Erstellen der Kategorie';
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

  const confirmed = window.confirm(`Möchtest du die Kategorie "${props.category.name}" wirklich löschen?`);
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
  <form
    class="max-w-3xl"
    @submit.prevent="handleSubmit"
  >
    <div
      v-if="error"
      class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
    >
      <p class="text-sm text-red-600 font-body">{{ error }}</p>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6">Kategoriedaten</h2>

      <div class="space-y-6">
        <div>
          <label
            for="name"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Name <span class="text-red-500">*</span>
          </label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
            placeholder="z.B. Vereinsnachrichten"
          />
        </div>

        <div>
          <label class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2">Beschreibung</label>
          <VsgMarkdownEditor
            v-model="formData.description"
            placeholder="Optionale Beschreibung der Kategorie..."
            min-height="200px"
          />
        </div>

        <div>
          <label class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2">Übergeordnete Kategorie</label>
          <VsgTreeSelect
            v-model="formData.parentId"
            :options="availableParentCategories"
            placeholder="Keine übergeordnete Kategorie"
            :disabled="categoriesStore.isLoading"
          />
          <p class="mt-1.5 text-xs text-gray-500 font-body">Optional: Wähle eine übergeordnete Kategorie, um eine Unterkategorie zu erstellen.</p>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between border-t border-gray-200 pt-6">
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
          {{ isSubmitting ? 'Speichern...' : 'Speichern' }}
        </button>
      </div>
    </div>
  </form>
</template>
