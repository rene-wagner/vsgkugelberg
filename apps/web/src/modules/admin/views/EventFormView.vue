<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useEventsStore, type EventItem } from '../stores/eventsStore';
import EventForm from '../components/forms/EventForm.vue';
import AdminPageHeader from '../components/AdminPageHeader.vue';
import AdminLoadingState from '../components/AdminLoadingState.vue';

const route = useRoute();
const eventsStore = useEventsStore();

const event = ref<EventItem | null>(null);
const isLoading = ref(false);

const isEditMode = computed(() => !!route.params.id);
const pageTitle = computed(() => (isEditMode.value ? 'VERANSTALTUNG BEARBEITEN' : 'VERANSTALTUNG ERSTELLEN'));
const pageSubtitle = computed(() => (isEditMode.value ? 'Bearbeite die Veranstaltungsdaten' : 'Erstelle eine neue Veranstaltung'));

onMounted(async () => {
  if (isEditMode.value) {
    isLoading.value = true;
    const id = Number(route.params.id);
    event.value = await eventsStore.fetchEvent(id);
    isLoading.value = false;
  }
});
</script>

<template>
  <div>
    <AdminPageHeader
      :title="pageTitle"
      :description="pageSubtitle"
    />

    <!-- Loading State -->
    <AdminLoadingState v-if="isLoading" />

    <!-- Form -->
    <EventForm
      v-else
      :event="event"
      :is-edit-mode="isEditMode"
    />
  </div>
</template>
