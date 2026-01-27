<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCategoriesStore, type Category, type CreateCategoryData, type UpdateCategoryData } from '../../stores/categoriesStore';
import VsgTreeSelect from '@/shared/components/VsgTreeSelect.vue';
import VsgMarkdownEditor from '@/shared/components/VsgMarkdownEditor.vue';
import VsgInput from '@/shared/components/VsgInput.vue';
import AdminButton from '../AdminButton.vue';

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
        router.push('/admin/kategorien');
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
        router.push('/admin/kategorien');
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
    router.push('/admin/kategorien');
  } else {
    error.value = categoriesStore.error || 'Fehler beim löschen der Kategorie';
  }
}

function handleCancel() {
  router.push('/admin/kategorien');
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
        <VsgInput
          id="name"
          v-model="formData.name"
          type="text"
          label="Name"
          placeholder="z.B. Vereinsnachrichten"
          variant="form"
          required
        />

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
      <AdminButton
        variant="secondary"
        @click="handleCancel"
      >
        Abbrechen
      </AdminButton>

      <div class="flex items-center gap-3">
        <AdminButton
          v-if="isEditMode"
          variant="danger-outline"
          :disabled="isSubmitting"
          @click="handleDelete"
        >
          Kategorie löschen
        </AdminButton>
        <AdminButton
          type="submit"
          size="large"
          :disabled="!canSubmit || isSubmitting"
          :loading="isSubmitting"
        >
          {{ isSubmitting ? 'Speichern...' : 'Speichern' }}
        </AdminButton>
      </div>
    </div>
  </form>
</template>
