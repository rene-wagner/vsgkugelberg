<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  useUsersStore,
  type User,
  type CreateUserData,
  type UpdateUserData,
} from '../stores/usersStore';

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
      return 'Passworter stimmen nicht uberein';
    }
  }
  if (password.value && !confirmPassword.value) {
    return 'Bitte Passwort bestatigen';
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
        router.push('/admin/users');
      } else {
        error.value =
          usersStore.error || 'Fehler beim Aktualisieren des Benutzers';
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
        router.push('/admin/users');
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

  const confirmed = window.confirm(
    `Mochtest du den Benutzer "${props.user.username}" wirklich löschen?`,
  );
  if (!confirmed) return;

  isSubmitting.value = true;
  const success = await usersStore.deleteUser(props.user.id);
  isSubmitting.value = false;

  if (success) {
    router.push('/admin/users');
  } else {
    error.value = usersStore.error || 'Fehler beim löschen des Benutzers';
  }
}

function handleCancel() {
  router.push('/admin/users');
}
</script>

<template>
  <form class="max-w-3xl" @submit.prevent="handleSubmit">
    <!-- Error Message -->
    <div
      v-if="error"
      class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
    >
      <p class="text-sm text-red-600 font-body">{{ error }}</p>
    </div>

    <!-- Account Data Section -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6">
        KONTODATEN
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Username -->
        <div>
          <label
            for="username"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Benutzername <span class="text-red-500">*</span>
          </label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
            placeholder="benutzername"
          />
        </div>

        <!-- Email -->
        <div>
          <label
            for="email"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            E-Mail Adresse <span class="text-red-500">*</span>
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
            placeholder="email@beispiel.de"
          />
        </div>
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
        Lasse die Felder leer, um das Passwort nicht zu andern.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Password -->
        <div>
          <label
            for="password"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            {{ isEditMode ? 'Neues Passwort' : 'Passwort' }}
            <span v-if="!isEditMode" class="text-red-500">*</span>
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            :required="!isEditMode"
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 placeholder-gray-400 text-sm focus:outline-none focus:border-vsg-blue-600"
            placeholder="********"
          />
        </div>

        <!-- Confirm Password -->
        <div>
          <label
            for="confirmPassword"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Passwort bestatigen
            <span v-if="!isEditMode" class="text-red-500">*</span>
          </label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            :required="!isEditMode"
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 placeholder-gray-400 text-sm focus:outline-none focus:border-vsg-blue-600"
            placeholder="********"
          />
        </div>
      </div>

      <!-- Password Error -->
      <p v-if="passwordError" class="mt-3 text-sm text-red-600 font-body">
        {{ passwordError }}
      </p>
    </div>

    <!-- Form Actions -->
    <div
      class="flex items-center justify-between border-t border-gray-200 pt-6"
    >
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
          Benutzer löschen
        </button>
        <button
          type="submit"
          class="px-8 py-2.5 bg-vsg-blue-600 text-white font-display text-sm tracking-wider rounded-lg hover:bg-vsg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!canSubmit || isSubmitting"
        >
          {{ isSubmitting ? 'SPEICHERN...' : 'SPEICHERN' }}
        </button>
      </div>
    </div>
  </form>
</template>
