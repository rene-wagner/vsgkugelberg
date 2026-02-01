<script setup lang="ts">
import { onMounted } from 'vue';
import { useDepartmentsStore, type Department } from '../stores/departmentsStore';
import { useMediaStore } from '../stores/mediaStore';
import VsgDataTable from '@/shared/components/VsgDataTable.vue';
import type { Column, ActionButton } from '@/shared/types/table.types';

const departmentsStore = useDepartmentsStore();
const mediaStore = useMediaStore();

onMounted(() => {
  departmentsStore.fetchDepartments();
});

async function handlePageChange(page: number) {
  await departmentsStore.fetchDepartments(page);
}

async function handleDelete(department: Department) {
  const confirmed = window.confirm(`Möchtest du die Abteilung "${department.name}" wirklich löschen?`);
  if (!confirmed) return;

  await departmentsStore.deleteDepartment(department.slug);
}

// Column definitions
const columns: Column<Department>[] = [
  {
    key: 'icon',
    label: 'Icon',
    width: 'w-16',
  },
  {
    key: 'name',
    label: 'Name',
  },
  {
    key: 'shortDescription',
    label: 'Beschreibung',
  },
];

// Action buttons
const actions: ActionButton<Department>[] = [
  {
    type: 'edit',
    to: (item) => `/admin/abteilungen/${item.slug}/edit`,
    title: 'Bearbeiten',
  },
  {
    type: 'delete',
    onClick: handleDelete,
    title: 'Löschen',
  },
];
</script>

<template>
  <VsgDataTable
    title="Abteilungen"
    description="Verwalte alle Abteilungen"
    add-button-text="Abteilung hinzufügen"
    add-button-route="/admin/abteilungen/new"
    :items="departmentsStore.departments"
    :columns="columns"
    :loading="departmentsStore.isLoading"
    :error="departmentsStore.error"
    :pagination="departmentsStore.meta"
    :actions="actions"
    empty-message="Keine Abteilungen vorhanden."
    empty-action-text="Erste Abteilung erstellen"
    empty-action-route="/admin/abteilungen/new"
    @page-change="handlePageChange"
  >
    <!-- Custom icon column rendering -->
    <template #cell-icon="{ item }">
      <div class="w-8 h-8 flex items-center justify-center">
        <img
          v-if="item.icon"
          :src="mediaStore.getMediaUrl(item.icon)"
          :alt="item.name"
          class="w-6 h-6 object-contain"
        />
        <span
          v-else
          class="text-gray-300"
          >-</span
        >
      </div>
    </template>
  </VsgDataTable>
</template>
