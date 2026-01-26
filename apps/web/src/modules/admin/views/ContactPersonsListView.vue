<script setup lang="ts">
import { onMounted } from 'vue';
import { useContactPersonsStore, type ContactPerson } from '../stores/contactPersonsStore';
import VsgDataTable from '@/shared/components/VsgDataTable.vue';
import type { Column, ActionButton } from '@/shared/types/table.types';

const contactPersonsStore = useContactPersonsStore();

onMounted(() => {
  contactPersonsStore.fetchContactPersons();
});

async function handlePageChange(page: number) {
  await contactPersonsStore.fetchContactPersons(page);
}

async function handleDelete(contactPerson: ContactPerson) {
  const confirmed = window.confirm(`Möchtest du den Ansprechpartner "${contactPerson.firstName} ${contactPerson.lastName}" wirklich löschen?`);
  if (!confirmed) return;

  await contactPersonsStore.deleteContactPerson(contactPerson.id);
}

// Column definitions
const columns: Column<ContactPerson>[] = [
  {
    key: 'name',
    label: 'Name',
    render: (item) => `${item.firstName} ${item.lastName}`,
  },
  {
    key: 'type',
    label: 'Funktion',
  },
  {
    key: 'phone',
    label: 'Telefon',
  },
  {
    key: 'email',
    label: 'E-Mail',
    render: (item) => item.email || '-',
  },
];

// Action buttons
const actions: ActionButton<ContactPerson>[] = [
  {
    type: 'edit',
    to: (item) => `/admin/kontakt/${item.id}/edit`,
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
    title="ANSPRECHPARTNER"
    description="Verwalte alle Ansprechpartner des Vereins"
    add-button-text="Ansprechpartner hinzufügen"
    add-button-route="/admin/kontakt/new"
    :items="contactPersonsStore.contactPersons"
    :columns="columns"
    :loading="contactPersonsStore.isLoading"
    :error="contactPersonsStore.error"
    :pagination="contactPersonsStore.meta"
    :actions="actions"
    empty-message="Keine Ansprechpartner vorhanden."
    empty-action-text="Ersten Ansprechpartner erstellen"
    empty-action-route="/admin/kontakt/new"
    @page-change="handlePageChange"
  />
</template>
