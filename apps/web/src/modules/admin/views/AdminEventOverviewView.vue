<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useEventsStore, type EventItem } from '../stores/eventsStore';
import VsgDataTable from '@/shared/components/VsgDataTable.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import type { Column, ActionButton } from '@/shared/types/table.types';
import { formatDate, formatTime } from '@/shared/utils/formatters';

const eventsStore = useEventsStore();

// Fetch a broad range of events for admin view (past year to next year)
const dateRange = computed(() => {
  const now = new Date();
  const start = new Date(now.getFullYear() - 1, 0, 1);
  const end = new Date(now.getFullYear() + 1, 11, 31);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
});

// Get unique event definitions (deduplicate recurring events by originalEventId)
const baseEvents = computed(() => {
  const seen = new Set<number>();
  const result: EventItem[] = [];

  for (const event of eventsStore.events) {
    // For non-recurring events, use the event id
    // For recurring instances, use the originalEventId to deduplicate
    const uniqueId = event.isRecurrenceInstance ? event.originalEventId! : event.id;

    if (!seen.has(uniqueId)) {
      seen.add(uniqueId);
      result.push(event);
    }
  }

  return result;
});

// Category badge colors
const categoryColors: Record<string, string> = {
  Meeting: 'bg-blue-100 text-blue-800',
  Sport: 'bg-green-100 text-green-800',
  Social: 'bg-yellow-100 text-yellow-800',
  Other: 'bg-gray-100 text-gray-800',
};

async function handleDelete(event: EventItem) {
  const confirmed = window.confirm(
    `Möchtest du die Veranstaltung "${event.title}" wirklich löschen?${event.recurrence ? ' Dies wird auch alle wiederkehrenden Termine löschen.' : ''}`,
  );
  if (!confirmed) return;

  await eventsStore.deleteEvent(event.id);
  // Refresh the list
  await eventsStore.fetchEvents(dateRange.value.start, dateRange.value.end);
}

onMounted(() => {
  eventsStore.fetchEvents(dateRange.value.start, dateRange.value.end);
});

// Column definitions
const columns: Column<EventItem>[] = [
  {
    key: 'title',
    label: 'Titel',
  },
  {
    key: 'startDate',
    label: 'Datum',
    render: (item) => formatDate(item.startDate),
  },
  {
    key: 'time',
    label: 'Zeit',
  },
  {
    key: 'category',
    label: 'Kategorie',
  },
  {
    key: 'recurrence',
    label: 'Wiederkehrend',
  },
];

// Action buttons
const actions: ActionButton<EventItem>[] = [
  {
    type: 'edit',
    to: (item) => `/admin/termine/${item.id}/edit`,
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
    title="VERANSTALTUNGEN"
    description="Verwalte alle Veranstaltungen und Termine"
    add-button-text="Veranstaltung hinzufügen"
    add-button-route="/admin/termine/new"
    :items="baseEvents"
    :columns="columns"
    :loading="eventsStore.isLoading"
    :error="eventsStore.error"
    :pagination="null"
    :actions="actions"
    empty-message="Keine Veranstaltungen vorhanden."
    empty-action-text="Erste Veranstaltung erstellen"
    empty-action-route="/admin/termine/new"
  >
    <!-- Custom title column with location -->
    <template #cell-title="{ item }">
      <div>
        <span class="font-body text-sm text-vsg-blue-900 font-medium">{{ item.title }}</span>
        <p
          v-if="item.location"
          class="text-xs text-gray-500 mt-0.5"
        >
          {{ item.location }}
        </p>
      </div>
    </template>

    <!-- Custom time column (full-day vs timed) -->
    <template #cell-time="{ item }">
      <span
        v-if="item.isFullDay"
        class="font-body text-sm text-gray-500"
      >
        Ganztags
      </span>
      <span
        v-else
        class="font-body text-sm text-gray-600"
      >
        {{ formatTime(item.startDate) }} - {{ formatTime(item.endDate) }}
      </span>
    </template>

    <!-- Custom category column with colored badge -->
    <template #cell-category="{ item }">
      <span
        :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', categoryColors[item.category] || categoryColors.Other]"
      >
        {{ item.category }}
      </span>
    </template>

    <!-- Custom recurrence column with icon -->
    <template #cell-recurrence="{ item }">
      <span
        v-if="item.recurrence"
        class="text-green-600"
      >
        <FontAwesomeIcon icon="arrows-rotate" />
      </span>
      <span
        v-else
        class="text-gray-300"
        >-</span
      >
    </template>
  </VsgDataTable>
</template>
