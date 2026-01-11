<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useCategoriesStore, type Category } from '../stores/categoriesStore';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const categoriesStore = useCategoriesStore();

interface FlattenedCategory extends Category {
  depth: number;
}

// Success message timer
let successTimer: ReturnType<typeof setTimeout> | null = null;

function clearSuccessMessage() {
  if (successTimer) {
    clearTimeout(successTimer);
  }
  successTimer = setTimeout(() => {
    categoriesStore.successMessage = null;
  }, 5000);
}

// Recursively flatten the category tree with depth information
function flattenCategories(categories: Category[], depth: number = 0): FlattenedCategory[] {
  const result: FlattenedCategory[] = [];

  for (const category of categories) {
    result.push({ ...category, depth });

    if (category.children && category.children.length > 0) {
      result.push(...flattenCategories(category.children, depth + 1));
    }
  }

  return result;
}

// Computed flattened categories for display
const flattenedCategories = computed(() => flattenCategories(categoriesStore.categories));

// Helper to calculate padding based on depth
function getPaddingLeft(depth: number): string {
  return `${depth * 1.5}rem`;
}

onMounted(() => {
  categoriesStore.fetchCategories();
});

async function handleDelete(slug: string, name: string) {
  const confirmed = window.confirm(`Möchtest du die Kategorie "${name}" wirklich löschen?`);
  if (!confirmed) return;

  await categoriesStore.deleteCategory(slug);
}

async function handleRecalculateSlugs() {
  const confirmed = window.confirm('Möchtest du wirklich alle Slug-Neuberechnungen durchführen?');
  if (!confirmed) return;

  await categoriesStore.recalculateSlugs();
  if (categoriesStore.successMessage) {
    clearSuccessMessage();
  }
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8 flex items-start justify-between">
      <div>
        <h1 class="font-display text-4xl tracking-wider text-vsg-blue-900">Kategorien</h1>
        <p class="font-body font-normal text-vsg-blue-600 mt-1">Verwalte alle Kategorien</p>
      </div>
      <div class="flex gap-3">
        <button
          class="px-6 py-2.5 border-2 border-vsg-blue-900 text-vsg-blue-900 font-display text-sm tracking-wider rounded-lg hover:bg-vsg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="categoriesStore.isRecalculating"
          @click="handleRecalculateSlugs"
        >
          {{ categoriesStore.isRecalculating ? 'Neuberechnung...' : 'Slug-Neuberechnung' }}
        </button>
        <router-link
          to="/admin/kategorien/new"
          class="px-6 py-2.5 bg-vsg-gold-400 text-vsg-blue-900 font-display text-sm tracking-wider rounded-lg hover:bg-vsg-gold-300 transition-colors"
        >
          Kategorie hinzufügen
        </router-link>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="categoriesStore.isLoading" class="flex items-center justify-center py-12">
      <div class="text-vsg-blue-600 font-body">Laden...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="categoriesStore.error" class="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
      <p class="text-sm text-red-600 font-body">{{ categoriesStore.error }}</p>
    </div>

    <!-- Success State -->
    <div v-if="categoriesStore.successMessage" class="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 flex items-center justify-between">
      <p class="text-sm text-green-600 font-body">
        {{ categoriesStore.successMessage }}
      </p>
      <button class="text-green-600 hover:text-green-700" @click="categoriesStore.successMessage = null">
        <FontAwesomeIcon icon="xmark" />
      </button>
    </div>

    <!-- Table -->
    <div v-else class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="text-left px-6 py-4 font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase">Name</th>
              <th class="text-left px-6 py-4 font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase">Slug</th>
              <th class="text-left px-6 py-4 font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase">Beschreibung</th>
              <th class="text-right px-6 py-4 font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase">Aktionen</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="category in flattenedCategories" :key="category.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4">
                <span
                  class="font-body text-sm text-vsg-blue-900 font-medium inline-flex items-center"
                  :style="{ paddingLeft: getPaddingLeft(category.depth) }"
                >
                  <span v-if="category.depth > 0" class="text-gray-300 mr-2">└</span>
                  {{ category.name }}
                </span>
              </td>
              <td class="px-6 py-4">
                <code class="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{{ category.slug }}</code>
              </td>
              <td class="px-6 py-4 font-body font-normal text-sm text-gray-600">
                {{ category.description || '-' }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-2">
                  <router-link
                    :to="`/admin/kategorien/${category.slug}/edit`"
                    class="p-2 text-gray-400 hover:text-vsg-blue-600 transition-colors"
                    title="Bearbeiten"
                  >
                    <FontAwesomeIcon icon="pen-to-square" />
                  </router-link>
                  <button
                    class="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Löschen"
                    @click="handleDelete(category.slug, category.name)"
                  >
                    <FontAwesomeIcon icon="trash" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="flattenedCategories.length === 0" class="px-6 py-12 text-center">
        <p class="font-body text-gray-500">Keine Kategorien vorhanden.</p>
        <router-link to="/admin/kategorien/new" class="inline-block mt-4 text-vsg-blue-600 hover:text-vsg-blue-700 font-body text-sm">
          Erste Kategorie erstellen
        </router-link>
      </div>

      <!-- Pagination -->
      <div v-if="flattenedCategories.length > 0" class="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div class="font-body font-normal text-sm text-gray-500">
          Zeige
          <span class="text-vsg-blue-900 font-medium">{{ flattenedCategories.length }}</span>
          Eintrage
        </div>
      </div>
    </div>
  </div>
</template>
