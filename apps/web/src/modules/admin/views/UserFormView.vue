<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useUsersStore, type User } from '../stores/usersStore';
import UserForm from '../components/UserForm.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const route = useRoute();
const usersStore = useUsersStore();

const user = ref<User | null>(null);
const isLoading = ref(false);

const isEditMode = computed(() => !!route.params.id);
const pageTitle = computed(() =>
  isEditMode.value ? 'BENUTZER BEARBEITEN' : 'BENUTZER ERSTELLEN',
);
const pageSubtitle = computed(() =>
  isEditMode.value
    ? 'Bearbeite die Benutzerdaten'
    : 'Erstelle einen neuen Benutzer',
);
const breadcrumbAction = computed(() =>
  isEditMode.value ? 'Bearbeiten' : 'Erstellen',
);

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
    <!-- Page Header -->
    <div class="mb-8">
      <div
        class="flex items-center gap-2 text-sm font-body font-normal text-gray-500 mb-2"
      >
        <router-link
          to="/admin/benutzer"
          class="hover:text-vsg-blue-600 transition-colors"
        >
          Benutzer
        </router-link>
        <FontAwesomeIcon icon="chevron-right" />
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
    <UserForm v-else :user="user" :is-edit-mode="isEditMode" />
  </div>
</template>
