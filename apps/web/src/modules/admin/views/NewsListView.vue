<script setup lang="ts">
import { onMounted } from 'vue';
import { useNewsStore, type NewsItem } from '../stores/newsStore';
import VsgDataTable from '@/shared/components/VsgDataTable.vue';
import type { Column, ActionButton } from '@/shared/types/table.types';
import { formatDate, getInitials } from '@/shared/utils/formatters';

const newsStore = useNewsStore();

onMounted(() => {
  newsStore.fetchNews();
});

async function handlePageChange(page: number) {
  await newsStore.fetchNews(page);
}

async function handleDelete(item: NewsItem) {
  const confirmed = window.confirm(`Möchtest du den Artikel "${item.title}" wirklich löschen?`);
  if (!confirmed) return;

  await newsStore.deleteNews(item.slug);
}

function getStatusBadgeClass(published: boolean) {
  return published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600';
}

function getStatusLabel(published: boolean) {
  return published ? 'Veröffentlicht' : 'Entwurf';
}

// Column definitions
const columns: Column<NewsItem>[] = [
  {
    key: 'title',
    label: 'Titel',
  },
  {
    key: 'author',
    label: 'Autor',
  },
  {
    key: 'published',
    label: 'Status',
  },
  {
    key: 'createdAt',
    label: 'Datum',
    render: (item) => formatDate(item.createdAt),
  },
];

// Action buttons
const actions: ActionButton<NewsItem>[] = [
  {
    type: 'edit',
    to: (item) => `/admin/beitraege/${item.slug}/edit`,
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
    title="Beiträge"
    description="Verwalte alle Beiträge"
    add-button-text="Beitrag hinzufügen"
    add-button-route="/admin/beitraege/new"
    :items="newsStore.news"
    :columns="columns"
    :loading="newsStore.isLoading"
    :error="newsStore.error"
    :pagination="newsStore.meta"
    :actions="actions"
    empty-message="Keine Artikel vorhanden."
    empty-action-text="Ersten Artikel erstellen"
    empty-action-route="/admin/beitraege/new"
    @page-change="handlePageChange"
  >
    <!-- Custom author column with avatar -->
    <template #cell-author="{ item }">
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 bg-vsg-blue-600 rounded-full flex items-center justify-center text-white font-display text-xs">
          {{ getInitials(item.author.username) }}
        </div>
        <span class="font-body font-normal text-sm text-gray-600">{{ item.author.username }}</span>
      </div>
    </template>

    <!-- Custom status column with badge -->
    <template #cell-published="{ item }">
      <span
        class="inline-block px-2 py-1 font-body text-xs rounded font-medium"
        :class="getStatusBadgeClass(item.published)"
      >
        {{ getStatusLabel(item.published) }}
      </span>
    </template>
  </VsgDataTable>
</template>
