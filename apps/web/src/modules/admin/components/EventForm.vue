<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useEventsStore, type EventItem, type CreateEventData, type UpdateEventData, type EventCategory } from '../stores/eventsStore';
import VsgMarkdownEditor from '@shared/components/VsgMarkdownEditor.vue';

const props = defineProps<{
  event: EventItem | null;
  isEditMode: boolean;
}>();

const router = useRouter();
const eventsStore = useEventsStore();

const title = ref('');
const description = ref('');
const startDate = ref('');
const startTime = ref('');
const endDate = ref('');
const endTime = ref('');
const isFullDay = ref(false);
const location = ref('');
const category = ref<EventCategory>('Meeting');
const recurrenceType = ref<'none' | 'daily' | 'weekly' | 'monthly'>('none');
const weeklyDays = ref<string[]>([]);
const error = ref('');
const isSubmitting = ref(false);

const categories: { value: EventCategory; label: string }[] = [
  { value: 'Meeting', label: 'Meeting' },
  { value: 'Sport', label: 'Sport' },
  { value: 'Social', label: 'Sozial' },
  { value: 'Other', label: 'Sonstiges' },
];

const weekDays = [
  { value: 'MO', label: 'Mo' },
  { value: 'TU', label: 'Di' },
  { value: 'WE', label: 'Mi' },
  { value: 'TH', label: 'Do' },
  { value: 'FR', label: 'Fr' },
  { value: 'SA', label: 'Sa' },
  { value: 'SU', label: 'So' },
];

// Parse date and time from ISO string (converting to local time for display)
function parseDateTime(isoString: string): { date: string; time: string } {
  const d = new Date(isoString);
  // Format date as YYYY-MM-DD in local timezone
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const date = `${year}-${month}-${day}`;
  // Format time as HH:MM in local timezone
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const time = `${hours}:${minutes}`;
  return { date, time };
}

// Watch for event prop changes to populate form
watch(
  () => props.event,
  (newEvent) => {
    if (newEvent) {
      title.value = newEvent.title;
      description.value = newEvent.description || '';
      location.value = newEvent.location || '';
      category.value = newEvent.category;
      isFullDay.value = newEvent.isFullDay;

      const start = parseDateTime(newEvent.startDate);
      startDate.value = start.date;
      startTime.value = start.time;

      const end = parseDateTime(newEvent.endDate);
      endDate.value = end.date;
      endTime.value = end.time;

      // Parse recurrence
      if (newEvent.recurrence) {
        if (newEvent.recurrence.includes('FREQ=DAILY')) {
          recurrenceType.value = 'daily';
        } else if (newEvent.recurrence.includes('FREQ=WEEKLY')) {
          recurrenceType.value = 'weekly';
          const byDayMatch = newEvent.recurrence.match(/BYDAY=([A-Z,]+)/);
          if (byDayMatch) {
            weeklyDays.value = byDayMatch[1].split(',');
          }
        } else if (newEvent.recurrence.includes('FREQ=MONTHLY')) {
          recurrenceType.value = 'monthly';
        }
      }
    }
  },
  { immediate: true },
);

const canSubmit = computed(() => {
  return (
    title.value.trim() !== '' &&
    startDate.value !== '' &&
    endDate.value !== '' &&
    (isFullDay.value || (startTime.value !== '' && endTime.value !== ''))
  );
});

// Build recurrence string
function buildRecurrence(): string | undefined {
  if (recurrenceType.value === 'none') return undefined;
  if (recurrenceType.value === 'daily') return 'FREQ=DAILY';
  if (recurrenceType.value === 'monthly') return 'FREQ=MONTHLY';
  if (recurrenceType.value === 'weekly') {
    if (weeklyDays.value.length === 0) return 'FREQ=WEEKLY';
    return `FREQ=WEEKLY;BYDAY=${weeklyDays.value.join(',')}`;
  }
  return undefined;
}

// Build ISO datetime string (treating input as local time)
function buildDateTime(date: string, time: string): string {
  if (isFullDay.value) {
    // For full-day events, use midnight local time
    const localDate = new Date(`${date}T00:00:00`);
    return localDate.toISOString();
  }
  // Create date in local timezone, then convert to ISO (UTC)
  const localDate = new Date(`${date}T${time}:00`);
  return localDate.toISOString();
}

async function handleSubmit() {
  if (!canSubmit.value) return;

  error.value = '';
  isSubmitting.value = true;

  try {
    const startDateTime = buildDateTime(startDate.value, startTime.value);
    const endDateTime = buildDateTime(endDate.value, endTime.value);
    const recurrence = buildRecurrence();

    if (props.isEditMode && props.event) {
      // Update existing event
      const updateData: UpdateEventData = {
        title: title.value,
        description: description.value || undefined,
        startDate: startDateTime,
        endDate: endDateTime,
        isFullDay: isFullDay.value,
        location: location.value || undefined,
        category: category.value,
        recurrence,
      };

      const result = await eventsStore.updateEvent(props.event.id, updateData);
      if (result) {
        router.push('/admin/events');
      } else {
        error.value = eventsStore.error || 'Fehler beim Aktualisieren der Veranstaltung';
      }
    } else {
      // Create new event
      const createData: CreateEventData = {
        title: title.value,
        description: description.value || undefined,
        startDate: startDateTime,
        endDate: endDateTime,
        isFullDay: isFullDay.value,
        location: location.value || undefined,
        category: category.value,
        recurrence,
      };

      const result = await eventsStore.createEvent(createData);
      if (result) {
        router.push('/admin/events');
      } else {
        error.value = eventsStore.error || 'Fehler beim Erstellen der Veranstaltung';
      }
    }
  } catch {
    error.value = 'Ein unerwarteter Fehler ist aufgetreten';
  } finally {
    isSubmitting.value = false;
  }
}

async function handleDelete() {
  if (!props.event) return;

  const confirmed = window.confirm(
    `Möchtest du die Veranstaltung "${props.event.title}" wirklich löschen?${props.event.recurrence ? ' Dies wird auch alle wiederkehrenden Termine löschen.' : ''}`,
  );
  if (!confirmed) return;

  isSubmitting.value = true;
  const success = await eventsStore.deleteEvent(props.event.id);
  isSubmitting.value = false;

  if (success) {
    router.push('/admin/events');
  } else {
    error.value = eventsStore.error || 'Fehler beim Löschen der Veranstaltung';
  }
}

function handleCancel() {
  router.push('/admin/events');
}

function toggleWeekDay(day: string) {
  const index = weeklyDays.value.indexOf(day);
  if (index === -1) {
    weeklyDays.value.push(day);
  } else {
    weeklyDays.value.splice(index, 1);
  }
}
</script>

<template>
  <form
    class="max-w-3xl"
    @submit.prevent="handleSubmit"
  >
    <!-- Error Message -->
    <div
      v-if="error"
      class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
    >
      <p class="text-sm text-red-600 font-body">{{ error }}</p>
    </div>

    <!-- Basic Info Section -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6">GRUNDDATEN</h2>

      <div class="space-y-6">
        <!-- Title -->
        <div>
          <label
            for="title"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Titel <span class="text-red-500">*</span>
          </label>
          <input
            id="title"
            v-model="title"
            type="text"
            required
            class="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
            placeholder="z.B. Volleyball Training"
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
          <VsgMarkdownEditor v-model="description" />
        </div>

        <!-- Category -->
        <div>
          <label
            for="category"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Kategorie <span class="text-red-500">*</span>
          </label>
          <select
            id="category"
            v-model="category"
            class="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
          >
            <option
              v-for="cat in categories"
              :key="cat.value"
              :value="cat.value"
            >
              {{ cat.label }}
            </option>
          </select>
        </div>

        <!-- Location -->
        <div>
          <label
            for="location"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Ort
          </label>
          <input
            id="location"
            v-model="location"
            type="text"
            class="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
            placeholder="z.B. Sporthalle A"
          />
        </div>
      </div>
    </div>

    <!-- Date/Time Section -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6">DATUM UND ZEIT</h2>

      <div class="space-y-6">
        <!-- Full Day Toggle -->
        <div class="flex items-center gap-3">
          <input
            id="isFullDay"
            v-model="isFullDay"
            type="checkbox"
            class="w-4 h-4 text-vsg-blue-600 border-gray-300 rounded focus:ring-vsg-blue-500"
          />
          <label
            for="isFullDay"
            class="font-body text-sm text-vsg-blue-900"
          >
            Ganztags
          </label>
        </div>

        <!-- Start Date/Time -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label
              for="startDate"
              class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
            >
              Startdatum <span class="text-red-500">*</span>
            </label>
            <input
              id="startDate"
              v-model="startDate"
              type="date"
              required
              class="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
            />
          </div>
          <div v-if="!isFullDay">
            <label
              for="startTime"
              class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
            >
              Startzeit <span class="text-red-500">*</span>
            </label>
            <input
              id="startTime"
              v-model="startTime"
              type="time"
              required
              class="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
            />
          </div>
        </div>

        <!-- End Date/Time -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label
              for="endDate"
              class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
            >
              Enddatum <span class="text-red-500">*</span>
            </label>
            <input
              id="endDate"
              v-model="endDate"
              type="date"
              required
              class="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
            />
          </div>
          <div v-if="!isFullDay">
            <label
              for="endTime"
              class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
            >
              Endzeit <span class="text-red-500">*</span>
            </label>
            <input
              id="endTime"
              v-model="endTime"
              type="time"
              required
              class="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Recurrence Section -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6">WIEDERHOLUNG</h2>

      <div class="space-y-6">
        <!-- Recurrence Type -->
        <div>
          <label
            for="recurrenceType"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Wiederholungsmuster
          </label>
          <select
            id="recurrenceType"
            v-model="recurrenceType"
            class="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
          >
            <option value="none">Keine Wiederholung</option>
            <option value="daily">Täglich</option>
            <option value="weekly">Wöchentlich</option>
            <option value="monthly">Monatlich</option>
          </select>
        </div>

        <!-- Weekly Day Selection -->
        <div v-if="recurrenceType === 'weekly'">
          <label class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"> An welchen Tagen? </label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="day in weekDays"
              :key="day.value"
              type="button"
              :class="[
                'px-3 py-1.5 rounded-lg text-sm font-body transition-colors',
                weeklyDays.includes(day.value) ? 'bg-vsg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              ]"
              @click="toggleWeekDay(day.value)"
            >
              {{ day.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Form Actions -->
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
          Veranstaltung löschen
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
