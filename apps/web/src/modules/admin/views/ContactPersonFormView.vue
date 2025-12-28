<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  useContactPersonsStore,
  type ContactPerson,
} from '../stores/contactPersonsStore';
import ContactPersonForm from '../components/ContactPersonForm.vue';

const route = useRoute();
const contactPersonsStore = useContactPersonsStore();

const contactPerson = ref<ContactPerson | null>(null);
const isLoading = ref(false);

const isEditMode = computed(() => !!route.params.id);
const pageTitle = computed(() =>
  isEditMode.value ? 'ANSPRECHPARTNER BEARBEITEN' : 'ANSPRECHPARTNER ERSTELLEN',
);
const pageSubtitle = computed(() =>
  isEditMode.value
    ? 'Bearbeite die Ansprechpartner-Daten'
    : 'Erstelle einen neuen Ansprechpartner',
);
const breadcrumbAction = computed(() =>
  isEditMode.value ? 'Bearbeiten' : 'Erstellen',
);

onMounted(async () => {
  if (isEditMode.value) {
    isLoading.value = true;
    const id = Number(route.params.id);
    contactPerson.value = await contactPersonsStore.fetchContactPerson(id);
    isLoading.value = false;
  }
});
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <div
        class="flex items-center gap-2 text-sm font-body font-normal text-gray-500 mb-2"
      >
        <router-link
          to="/admin/contact-persons"
          class="hover:text-vsg-blue-600 transition-colors"
        >
          Ansprechpartner
        </router-link>
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span class="text-vsg-blue-600">{{ breadcrumbAction }}</span>
      </div>
      <h1 class="font-display text-4xl tracking-wider text-vsg-blue-900">
        {{ pageTitle }}
      </h1>
      <p class="font-body font-normal text-vsg-blue-600 mt-1">
        {{ pageSubtitle }}
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-vsg-blue-600 font-body">Laden...</div>
    </div>

    <!-- Form -->
    <ContactPersonForm
      v-else
      :contact-person="contactPerson"
      :is-edit-mode="isEditMode"
    />
  </div>
</template>
