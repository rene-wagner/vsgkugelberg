<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useContactPersonsStore, type ContactPerson } from '../stores/contactPersonsStore';
import ContactPersonForm from '../components/forms/ContactPersonForm.vue';
import AdminPageHeader from '../components/AdminPageHeader.vue';

const route = useRoute();
const contactPersonsStore = useContactPersonsStore();

const contactPerson = ref<ContactPerson | null>(null);
const isLoading = ref(false);

const isEditMode = computed(() => !!route.params.id);
const pageTitle = computed(() => (isEditMode.value ? 'ANSPRECHPARTNER BEARBEITEN' : 'ANSPRECHPARTNER ERSTELLEN'));
const pageSubtitle = computed(() => (isEditMode.value ? 'Bearbeite die Ansprechpartner-Daten' : 'Erstelle einen neuen Ansprechpartner'));

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
    <AdminPageHeader
      :title="pageTitle"
      :description="pageSubtitle"
    />

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="flex items-center justify-center py-12"
    >
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
