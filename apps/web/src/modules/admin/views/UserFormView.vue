<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useUsersStore, type User } from '../stores/usersStore';
import UserForm from '../components/forms/UserForm.vue';
import AdminPageHeader from '../components/AdminPageHeader.vue';

const route = useRoute();
const usersStore = useUsersStore();

const user = ref<User | null>(null);
const isLoading = ref(false);

const isEditMode = computed(() => !!route.params.id);
const pageTitle = computed(() => (isEditMode.value ? 'BENUTZER BEARBEITEN' : 'BENUTZER ERSTELLEN'));
const pageSubtitle = computed(() => (isEditMode.value ? 'Bearbeite die Benutzerdaten' : 'Erstelle einen neuen Benutzer'));

onMounted(async () => {
  if (isEditMode.value) {
    isLoading.value = true;
    const userId = Number(route.params.id);
    user.value = await usersStore.fetchUser(userId);
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
    <UserForm
      v-else
      :user="user"
      :is-edit-mode="isEditMode"
    />
  </div>
</template>
