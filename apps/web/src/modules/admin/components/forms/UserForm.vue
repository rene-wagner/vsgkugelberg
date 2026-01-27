<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUsersStore, type User, type CreateUserData, type UpdateUserData } from '../../stores/usersStore';
import VsgPasswordInput from '@shared/components/VsgPasswordInput.vue';
import VsgInput from '@/shared/components/VsgInput.vue';
import AdminButton from '../AdminButton.vue';

const props = defineProps<{
  user: User | null;
  isEditMode: boolean;
}>();

const router = useRouter();
const usersStore = useUsersStore();

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const isSubmitting = ref(false);

// Watch for user prop changes to populate form
watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      username.value = newUser.username;
      email.value = newUser.email;
    }
  },
  { immediate: true },
);

const passwordError = computed(() => {
  if (password.value && confirmPassword.value) {
    if (password.value !== confirmPassword.value) {
      return 'Passwörter stimmen nicht überein';
    }
  }
  if (password.value && !confirmPassword.value) {
    return 'Bitte Passwort bestätigen';
  }
  if (!password.value && confirmPassword.value) {
    return 'Bitte Passwort eingeben';
  }
  return '';
});

const isPasswordRequired = computed(() => !props.isEditMode);

const canSubmit = computed(() => {
  if (!username.value || !email.value) return false;
  if (passwordError.value) return false;
  if (isPasswordRequired.value && !password.value) return false;
  return true;
});

async function handleSubmit() {
  if (!canSubmit.value) return;

  error.value = '';
  isSubmitting.value = true;

  try {
    if (props.isEditMode && props.user) {
      // Update existing user
      const updateData: UpdateUserData = {
        username: username.value,
        email: email.value,
      };
      // Only include password if both fields are filled
      if (password.value && confirmPassword.value) {
        updateData.password = password.value;
      }

      const result = await usersStore.updateUser(props.user.id, updateData);
      if (result) {
        router.push('/admin/benutzer');
      } else {
        error.value = usersStore.error || 'Fehler beim Aktualisieren des Benutzers';
      }
    } else {
      // Create new user
      const createData: CreateUserData = {
        username: username.value,
        email: email.value,
        password: password.value,
      };

      const result = await usersStore.createUser(createData);
      if (result) {
        router.push('/admin/benutzer');
      } else {
        error.value = usersStore.error || 'Fehler beim Erstellen des Benutzers';
      }
    }
  } catch {
    error.value = 'Ein unerwarteter Fehler ist aufgetreten';
  } finally {
    isSubmitting.value = false;
  }
}

async function handleDelete() {
  if (!props.user) return;

  const confirmed = window.confirm(`Möchtest du den Benutzer "${props.user.username}" wirklich löschen?`);
  if (!confirmed) return;

  isSubmitting.value = true;
  const success = await usersStore.deleteUser(props.user.id);
  isSubmitting.value = false;

  if (success) {
    router.push('/admin/benutzer');
  } else {
    error.value = usersStore.error || 'Fehler beim löschen des Benutzers';
  }
}

function handleCancel() {
  router.push('/admin/benutzer');
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

    <!-- Account Data Section -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6">KONTODATEN</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Username -->
        <VsgInput
          id="username"
          v-model="username"
          type="text"
          label="Benutzername"
          placeholder="benutzername"
          variant="form"
          required
        />

        <!-- Email -->
        <VsgInput
          id="email"
          v-model="email"
          type="email"
          label="E-Mail Adresse"
          placeholder="email@beispiel.de"
          variant="form"
          required
        />
      </div>
    </div>

    <!-- Password Section -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6">
        {{ isEditMode ? 'PASSWORT ANDERN' : 'PASSWORT' }}
      </h2>
      <p
        v-if="isEditMode"
        class="font-body font-normal text-sm text-gray-500 mb-6"
      >
        Lasse die Felder leer, um das Passwort nicht zu ändern.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Password -->
        <VsgPasswordInput
          id="password"
          v-model="password"
          :label="isEditMode ? 'Neues Passwort' : 'Passwort'"
          :required="!isEditMode"
          variant="admin"
        >
          <template
            v-if="!isEditMode"
            #label-suffix
          >
            <span class="text-red-500">*</span>
          </template>
        </VsgPasswordInput>

        <!-- Confirm Password -->
        <VsgPasswordInput
          id="confirmPassword"
          v-model="confirmPassword"
          label="Passwort bestätigen"
          :required="!isEditMode"
          variant="admin"
        >
          <template
            v-if="!isEditMode"
            #label-suffix
          >
            <span class="text-red-500">*</span>
          </template>
        </VsgPasswordInput>
      </div>

      <!-- Password Error -->
      <p
        v-if="passwordError"
        class="mt-3 text-sm text-red-600 font-body"
      >
        {{ passwordError }}
      </p>
    </div>

    <!-- Form Actions -->
    <div class="flex items-center justify-between border-t border-gray-200 pt-6">
      <AdminButton
        variant="secondary"
        @click="handleCancel"
      >
        Abbrechen
      </AdminButton>

      <div class="flex items-center gap-3">
        <AdminButton
          v-if="isEditMode"
          variant="danger-outline"
          :disabled="isSubmitting"
          @click="handleDelete"
        >
          Benutzer löschen
        </AdminButton>
        <AdminButton
          type="submit"
          size="large"
          :disabled="!canSubmit || isSubmitting"
          :loading="isSubmitting"
        >
          {{ isSubmitting ? 'Speichern...' : 'Speichern' }}
        </AdminButton>
      </div>
    </div>
  </form>
</template>
