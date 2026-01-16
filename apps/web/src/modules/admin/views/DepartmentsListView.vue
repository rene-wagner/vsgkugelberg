<script setup lang="ts">
import { onMounted } from 'vue';
import { useDepartmentsStore } from '../stores/departmentsStore';
import { useMediaStore } from '../stores/mediaStore';
import VsgPagination from '@/shared/components/VsgPagination.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const departmentsStore = useDepartmentsStore();
const mediaStore = useMediaStore();

onMounted(() => {
  departmentsStore.fetchDepartments();
});

async function handlePageChange(page: number) {
  await departmentsStore.fetchDepartments(page);
}

async function handleDelete(slug: string, name: string) {
  const confirmed = window.confirm(`Möchtest du die Abteilung "${name}" wirklich löschen?`);
  if (!confirmed) return;

  await departmentsStore.deleteDepartment(slug);
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8 flex items-start justify-between">
      <div>
        <h1 class="font-display text-4xl tracking-wider text-vsg-blue-900">Abteilungen</h1>
        <p class="font-body font-normal text-vsg-blue-600 mt-1">Verwalte alle Abteilungen</p>
      </div>
      <router-link
        to="/admin/abteilungen/new"
        class="px-6 py-2.5 bg-vsg-gold-400 text-vsg-blue-900 font-display text-sm tracking-wider rounded-lg hover:bg-vsg-gold-300 transition-colors"
      >
        Abteilung hinzufügen
      </router-link>
    </div>

    <!-- Loading State -->
    <div
      v-if="departmentsStore.isLoading"
      class="flex items-center justify-center py-12"
    >
      <div class="text-vsg-blue-600 font-body">Laden...</div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="departmentsStore.error"
      class="bg-red-50 border border-red-200 rounded-xl p-6 mb-6"
    >
      <p class="text-sm text-red-600 font-body">{{ departmentsStore.error }}</p>
    </div>

    <!-- Table -->
    <div
      v-else
      class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm"
    >
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="text-left px-6 py-4 font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase w-16">Icon</th>
              <th class="text-left px-6 py-4 font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase">Name</th>
              <th class="text-left px-6 py-4 font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase">Beschreibung</th>
              <th class="text-right px-6 py-4 font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase">Aktionen</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="department in departmentsStore.departments"
              :key="department.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="w-8 h-8 flex items-center justify-center">
                  <img
                    v-if="department.icon"
                    :src="mediaStore.getMediaUrl(department.icon)"
                    :alt="department.name"
                    class="w-6 h-6 object-contain"
                  />
                  <span
                    v-else
                    class="text-gray-300"
                    >-</span
                  >
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="font-body text-sm text-vsg-blue-900 font-medium">{{ department.name }}</span>
              </td>
              <td class="px-6 py-4 font-body font-normal text-sm text-gray-600">
                {{ department.shortDescription }}
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-2">
                  <router-link
                    :to="`/admin/abteilungen/${department.slug}/edit`"
                    class="p-2 text-gray-400 hover:text-vsg-blue-600 transition-colors"
                    title="Bearbeiten"
                  >
                    <FontAwesomeIcon icon="pen-to-square" />
                  </router-link>
                  <button
                    class="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Löschen"
                    @click="handleDelete(department.slug, department.name)"
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
      <div
        v-if="departmentsStore.departments.length === 0"
        class="px-6 py-12 text-center"
      >
        <p class="font-body text-gray-500">Keine Abteilungen vorhanden.</p>
        <router-link
          to="/admin/abteilungen/new"
          class="inline-block mt-4 text-vsg-blue-600 hover:text-vsg-blue-700 font-body text-sm"
        >
          Erste Abteilung erstellen
        </router-link>
      </div>

      <!-- Pagination -->
      <VsgPagination
        v-if="departmentsStore.departments.length > 0"
        :meta="departmentsStore.meta"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>
