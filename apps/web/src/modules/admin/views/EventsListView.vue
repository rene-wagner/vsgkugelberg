<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useEventsStore, type EventItem } from '../stores/eventsStore';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

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
    const uniqueId = event.isRecurrenceInstance
      ? event.originalEventId!
      : event.id;

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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

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
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8 flex items-start justify-between">
      <div>
        <h1 class="font-display text-4xl tracking-wider text-vsg-blue-900">
          VERANSTALTUNGEN
        </h1>
        <p class="font-body font-normal text-vsg-blue-600 mt-1">
          Verwalte alle Veranstaltungen und Termine
        </p>
      </div>
      <router-link
        to="/admin/termine/new"
        class="px-6 py-2.5 bg-vsg-gold-400 text-vsg-blue-900 font-display text-sm tracking-wider rounded-lg hover:bg-vsg-gold-300 transition-colors"
      >
        Veranstaltung hinzufügen
      </router-link>
    </div>

    <!-- Loading State -->
    <div
      v-if="eventsStore.isLoading"
      class="flex items-center justify-center py-12"
    >
      <div class="text-vsg-blue-600 font-body">Laden...</div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="eventsStore.error"
      class="bg-red-50 border border-red-200 rounded-xl p-6 mb-6"
    >
      <p class="text-sm text-red-600 font-body">{{ eventsStore.error }}</p>
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
              <th
                class="text-left px-6 py-4 font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase"
              >
                Titel
              </th>
              <th
                class="text-left px-6 py-4 font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase"
              >
                Datum
              </th>
              <th
                class="text-left px-6 py-4 font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase"
              >
                Zeit
              </th>
              <th
                class="text-left px-6 py-4 font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase"
              >
                Kategorie
              </th>
              <th
                class="text-left px-6 py-4 font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase"
              >
                Wiederkehrend
              </th>
              <th
                class="text-right px-6 py-4 font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase"
              >
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="event in baseEvents"
              :key="event.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4">
                <div>
                  <span
                    class="font-body text-sm text-vsg-blue-900 font-medium"
                    >{{ event.title }}</span
                  >
                  <p v-if="event.location" class="text-xs text-gray-500 mt-0.5">
                    {{ event.location }}
                  </p>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="font-body text-sm text-gray-600">{{
                  formatDate(event.startDate)
                }}</span>
              </td>
              <td class="px-6 py-4">
                <span
                  v-if="event.isFullDay"
                  class="font-body text-sm text-gray-500"
                >
                  Ganztags
                </span>
                <span v-else class="font-body text-sm text-gray-600">
                  {{ formatTime(event.startDate) }} -
                  {{ formatTime(event.endDate) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    categoryColors[event.category] || categoryColors.Other,
                  ]"
                >
                  {{ event.category }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span v-if="event.recurrence" class="text-green-600">
                  <font-awesome-icon icon="arrows-rotate" />
                </span>
                <span v-else class="text-gray-300">-</span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-2">
                  <router-link
                    :to="`/admin/termine/${event.id}/edit`"
                    class="p-2 text-gray-400 hover:text-vsg-blue-600 transition-colors"
                    title="Bearbeiten"
                  >
                    <FontAwesomeIcon icon="pen-to-square" />
                  </router-link>
                  <button
                    class="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Löschen"
                    @click="handleDelete(event)"
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
      <div v-if="baseEvents.length === 0" class="px-6 py-12 text-center">
        <p class="font-body text-gray-500">Keine Veranstaltungen vorhanden.</p>
        <router-link
          to="/admin/termine/new"
          class="inline-block mt-4 text-vsg-blue-600 hover:text-vsg-blue-700 font-body text-sm"
        >
          Erste Veranstaltung erstellen
        </router-link>
      </div>

      <!-- Pagination -->
      <div
        v-if="baseEvents.length > 0"
        class="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50"
      >
        <div class="font-body font-normal text-sm text-gray-500">
          Zeige
          <span class="text-vsg-blue-900 font-medium">{{
            baseEvents.length
          }}</span>
          Veranstaltungen
        </div>
      </div>
    </div>
  </div>
</template>
