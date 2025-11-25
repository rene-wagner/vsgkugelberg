<script setup lang="ts">
import { ref, computed, watch } from 'vue';

export type UserFormPayload = {
  username: string;
  email: string;
  password: string;
};

export type UserFormInitialData = {
  username: string;
  email: string;
};

const props = defineProps<{
  loading?: boolean;
  error?: string | null;
  initialData?: UserFormInitialData | null;
}>();

const emit = defineEmits<{
  save: [payload: UserFormPayload];
  cancel: [];
}>();

const isEditMode = computed(() => !!props.initialData);

const username = ref(props.initialData?.username ?? '');
const email = ref(props.initialData?.email ?? '');
const password = ref('');
const passwordConfirm = ref('');

// Watch for initialData changes to reset form
watch(
  () => props.initialData,
  (newData) => {
    username.value = newData?.username ?? '';
    email.value = newData?.email ?? '';
    password.value = ''; // Never prefill password for security
    passwordConfirm.value = ''; // Reset confirmation field as well
  }
);

const usernameError = ref<string | null>(null);
const emailError = ref<string | null>(null);
const passwordError = ref<string | null>(null);
const passwordConfirmError = ref<string | null>(null);

const isValid = computed(() => {
  const hasValidUsername = username.value.trim().length >= 3;
  const hasValidEmail = email.value.trim().length > 0 && email.value.includes('@');
  const hasValidPassword = isEditMode.value || password.value.length >= 6;
  const passwordsMatch =
    password.value === passwordConfirm.value ||
    (isEditMode.value && !password.value && !passwordConfirm.value);
  return hasValidUsername && hasValidEmail && hasValidPassword && passwordsMatch;
});

const validateForm = (): boolean => {
  let valid = true;

  // Validate username
  if (!username.value.trim()) {
    usernameError.value = 'Benutzername ist erforderlich';
    valid = false;
  } else if (username.value.trim().length < 3) {
    usernameError.value = 'Benutzername muss mindestens 3 Zeichen lang sein';
    valid = false;
  } else if (username.value.trim().length > 50) {
    usernameError.value = 'Benutzername darf maximal 50 Zeichen lang sein';
    valid = false;
  } else {
    usernameError.value = null;
  }

  // Validate email
  if (!email.value.trim()) {
    emailError.value = 'E-Mail ist erforderlich';
    valid = false;
  } else if (!email.value.includes('@')) {
    emailError.value = 'Bitte geben Sie eine gueltige E-Mail-Adresse ein';
    valid = false;
  } else {
    emailError.value = null;
  }

  // Validate password (required for create, optional for edit)
  if (!isEditMode.value) {
    if (!password.value) {
      passwordError.value = 'Passwort ist erforderlich';
      valid = false;
    } else if (password.value.length < 6) {
      passwordError.value = 'Passwort muss mindestens 6 Zeichen lang sein';
      valid = false;
    } else {
      passwordError.value = null;
    }
  } else {
    // In edit mode, only validate if password is provided
    if (password.value && password.value.length < 6) {
      passwordError.value = 'Passwort muss mindestens 6 Zeichen lang sein';
      valid = false;
    } else {
      passwordError.value = null;
    }
  }

  // Validate password confirmation
  if (password.value || passwordConfirm.value) {
    if (password.value !== passwordConfirm.value) {
      passwordConfirmError.value = 'Passwoerter stimmen nicht ueberein';
      valid = false;
    } else {
      passwordConfirmError.value = null;
    }
  } else {
    passwordConfirmError.value = null;
  }

  return valid;
};

const handleSave = () => {
  if (!validateForm()) {
    return;
  }

  emit('save', {
    username: username.value.trim(),
    email: email.value.trim(),
    password: password.value,
  });
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<template>
  <form class="vsg-user-form" @submit.prevent="handleSave">
    <!-- Error Alert -->
    <div
      v-if="error"
      class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
    >
      {{ error }}
    </div>

    <!-- Username Field -->
    <div class="mb-4">
      <label for="user-username" class="block text-sm font-medium text-gray-700 mb-1">
        Benutzername <span class="text-red-500">*</span>
      </label>
      <input
        id="user-username"
        v-model="username"
        type="text"
        :disabled="loading"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00295e] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        :class="{ 'border-red-500': usernameError }"
        placeholder="Benutzername eingeben..."
        @input="usernameError = null"
      />
      <p v-if="usernameError" class="mt-1 text-sm text-red-500">{{ usernameError }}</p>
    </div>

    <!-- Email Field -->
    <div class="mb-4">
      <label for="user-email" class="block text-sm font-medium text-gray-700 mb-1">
        E-Mail <span class="text-red-500">*</span>
      </label>
      <input
        id="user-email"
        v-model="email"
        type="email"
        :disabled="loading"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00295e] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        :class="{ 'border-red-500': emailError }"
        placeholder="E-Mail-Adresse eingeben..."
        @input="emailError = null"
      />
      <p v-if="emailError" class="mt-1 text-sm text-red-500">{{ emailError }}</p>
    </div>

    <!-- Password Field -->
    <div class="mb-4">
      <label for="user-password" class="block text-sm font-medium text-gray-700 mb-1">
        Passwort
        <span v-if="!isEditMode" class="text-red-500">*</span>
        <span v-else class="text-gray-500 text-xs ml-1">(leer lassen um beizubehalten)</span>
      </label>
      <input
        id="user-password"
        v-model="password"
        type="password"
        :disabled="loading"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00295e] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        :class="{ 'border-red-500': passwordError }"
        placeholder="Passwort eingeben..."
        autocomplete="new-password"
        @input="passwordError = null"
      />
      <p v-if="passwordError" class="mt-1 text-sm text-red-500">{{ passwordError }}</p>
    </div>

    <!-- Password Confirmation Field -->
    <div class="mb-4">
      <label for="user-password-confirm" class="block text-sm font-medium text-gray-700 mb-1">
        Passwort bestaetigen
        <span v-if="!isEditMode" class="text-red-500">*</span>
      </label>
      <input
        id="user-password-confirm"
        v-model="passwordConfirm"
        type="password"
        :disabled="loading"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00295e] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        :class="{ 'border-red-500': passwordConfirmError }"
        placeholder="Passwort bestaetigen..."
        autocomplete="new-password"
        @input="passwordConfirmError = null"
      />
      <p v-if="passwordConfirmError" class="mt-1 text-sm text-red-500">
        {{ passwordConfirmError }}
      </p>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-3 justify-end">
      <button
        type="button"
        :disabled="loading"
        class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        @click="handleCancel"
      >
        Abbrechen
      </button>
      <button
        type="submit"
        :disabled="loading || !isValid"
        class="px-4 py-2 text-white bg-[#00295e] hover:bg-[#003d8a] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <svg
          v-if="loading"
          class="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span>{{ loading ? 'Speichern...' : 'Speichern' }}</span>
      </button>
    </div>
  </form>
</template>

<style scoped>
.vsg-user-form {
  padding: 1rem;
}
</style>
