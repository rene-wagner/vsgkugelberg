<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { ref, computed, onMounted } from 'vue';

const props = defineProps<{
  contactPersonId: number;
  contactPersonName: string;
}>();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Form state
const senderName = ref('');
const senderEmail = ref('');
const subject = ref('');
const message = ref('');

// Honeypot fields
const website = ref('');
const timestamp = ref('');

// UI state
const isSubmitting = ref(false);
const submitSuccess = ref(false);
const submitError = ref<string | null>(null);

// Validation state
const errors = ref<Record<string, string>>({});

// Fetch encrypted timestamp token from API
const fetchToken = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/contact/token`);
    if (response.ok) {
      const data = await response.json();
      timestamp.value = data.token;
    }
  } catch (_e) {
    // Silently fail - form will still work but honeypot validation may fail
    console.warn('Failed to fetch contact form token');
  }
};

// Generate encrypted timestamp on mount
onMounted(() => {
  fetchToken();
});

// Validation
const validateField = (field: string, value: string): string | null => {
  switch (field) {
    case 'senderName':
      if (!value.trim()) return 'Name ist erforderlich';
      if (value.trim().length < 2) return 'Name muss mindestens 2 Zeichen haben';
      if (value.trim().length > 100) return 'Name darf maximal 100 Zeichen haben';
      return null;
    case 'senderEmail': {
      if (!value.trim()) return 'E-Mail ist erforderlich';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.trim())) return 'Bitte geben Sie eine gueltige E-Mail-Adresse ein';
      return null;
    }
    case 'subject':
      if (!value.trim()) return 'Betreff ist erforderlich';
      if (value.trim().length < 5) return 'Betreff muss mindestens 5 Zeichen haben';
      if (value.trim().length > 200) return 'Betreff darf maximal 200 Zeichen haben';
      return null;
    case 'message':
      if (!value.trim()) return 'Nachricht ist erforderlich';
      if (value.trim().length < 10) return 'Nachricht muss mindestens 10 Zeichen haben';
      if (value.trim().length > 5000) return 'Nachricht darf maximal 5000 Zeichen haben';
      return null;
    default:
      return null;
  }
};

const validateForm = (): boolean => {
  errors.value = {};

  const nameError = validateField('senderName', senderName.value);
  if (nameError) errors.value.senderName = nameError;

  const emailError = validateField('senderEmail', senderEmail.value);
  if (emailError) errors.value.senderEmail = emailError;

  const subjectError = validateField('subject', subject.value);
  if (subjectError) errors.value.subject = subjectError;

  const messageError = validateField('message', message.value);
  if (messageError) errors.value.message = messageError;

  return Object.keys(errors.value).length === 0;
};

const isFormValid = computed(() => {
  return (
    senderName.value.trim().length >= 2 &&
    senderEmail.value.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail.value.trim()) &&
    subject.value.trim().length >= 5 &&
    message.value.trim().length >= 10
  );
});

// Submit handler
const submitForm = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;
  submitError.value = null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contactPersonId: props.contactPersonId,
        senderName: senderName.value.trim(),
        senderEmail: senderEmail.value.trim(),
        subject: subject.value.trim(),
        message: message.value.trim(),
        website: website.value, // Honeypot
        timestamp: timestamp.value, // Timing validation
      }),
    });

    if (response.status === 429) {
      submitError.value = 'Zu viele Anfragen. Bitte versuchen Sie es spaeter erneut.';
      return;
    }

    if (!response.ok) {
      const data = await response.json();
      submitError.value = data.message || 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
      return;
    }

    // Success!
    submitSuccess.value = true;

    // Reset form
    senderName.value = '';
    senderEmail.value = '';
    subject.value = '';
    message.value = '';

    // Fetch new token for potential next submission
    await fetchToken();
  } catch (_e) {
    submitError.value = 'Ein Netzwerkfehler ist aufgetreten. Bitte ueberpruefen Sie Ihre Internetverbindung.';
  } finally {
    isSubmitting.value = false;
  }
};

// Clear success message to allow new submission
const clearSuccess = () => {
  submitSuccess.value = false;
};
</script>

<template>
  <div class="mt-8 bg-white border border-vsg-blue-100 rounded-2xl p-8">
    <h3 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6">Nachricht an {{ contactPersonName }}</h3>

    <!-- Success Message -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div v-if="submitSuccess" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl" role="alert" aria-live="polite">
        <div class="flex items-start gap-3">
          <FontAwesomeIcon icon="check" class="text-green-600 mt-0.5 shrink-0" />
          <div class="flex-1">
            <p class="font-body text-green-800">Ihre Nachricht wurde erfolgreich gesendet. Vielen Dank fuer Ihre Anfrage!</p>
            <button class="mt-2 text-sm text-green-700 hover:text-green-900 underline font-body" @click="clearSuccess">
              Weitere Nachricht senden
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Error Message -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div v-if="submitError" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl" role="alert" aria-live="polite">
        <div class="flex items-start gap-3">
          <FontAwesomeIcon icon="exclamation-triangle" class="text-red-600 mt-0.5 shrink-0" />
          <p class="font-body text-red-800">{{ submitError }}</p>
        </div>
      </div>
    </Transition>

    <!-- Form -->
    <form v-if="!submitSuccess" class="space-y-5" @submit.prevent="submitForm">
      <div class="absolute" style="left: -9999px; position: absolute" aria-hidden="true">
        <label for="website">Website (Leave this field blank)</label>
        <input id="website" v-model="website" type="text" name="website" tabindex="-1" autocomplete="off" />
      </div>
      <input type="hidden" name="timestamp" :value="timestamp" />

      <!-- Name Field -->
      <div>
        <label for="senderName" class="block font-body font-normal text-sm tracking-wider text-vsg-blue-600 uppercase mb-2"> Ihr Name * </label>
        <input
          id="senderName"
          v-model="senderName"
          type="text"
          required
          maxlength="100"
          :disabled="isSubmitting"
          :class="[
            'w-full px-4 py-3 bg-white border-2 rounded-xl font-body text-vsg-blue-900 transition-colors',
            'focus:outline-none focus:border-vsg-gold-400',
            errors.senderName ? 'border-red-300' : 'border-vsg-blue-200',
            isSubmitting ? 'opacity-50 cursor-not-allowed' : '',
          ]"
          placeholder="Max Mustermann"
        />
        <p v-if="errors.senderName" class="mt-1 text-sm text-red-600 font-body">
          {{ errors.senderName }}
        </p>
      </div>

      <!-- Email Field -->
      <div>
        <label for="senderEmail" class="block font-body font-normal text-sm tracking-wider text-vsg-blue-600 uppercase mb-2"> Ihre E-Mail * </label>
        <input
          id="senderEmail"
          v-model="senderEmail"
          type="email"
          required
          :disabled="isSubmitting"
          :class="[
            'w-full px-4 py-3 bg-white border-2 rounded-xl font-body text-vsg-blue-900 transition-colors',
            'focus:outline-none focus:border-vsg-gold-400',
            errors.senderEmail ? 'border-red-300' : 'border-vsg-blue-200',
            isSubmitting ? 'opacity-50 cursor-not-allowed' : '',
          ]"
          placeholder="max@beispiel.de"
        />
        <p v-if="errors.senderEmail" class="mt-1 text-sm text-red-600 font-body">
          {{ errors.senderEmail }}
        </p>
      </div>

      <!-- Subject Field -->
      <div>
        <label for="subject" class="block font-body font-normal text-sm tracking-wider text-vsg-blue-600 uppercase mb-2"> Betreff * </label>
        <input
          id="subject"
          v-model="subject"
          type="text"
          required
          maxlength="200"
          :disabled="isSubmitting"
          :class="[
            'w-full px-4 py-3 bg-white border-2 rounded-xl font-body text-vsg-blue-900 transition-colors',
            'focus:outline-none focus:border-vsg-gold-400',
            errors.subject ? 'border-red-300' : 'border-vsg-blue-200',
            isSubmitting ? 'opacity-50 cursor-not-allowed' : '',
          ]"
          placeholder="Ihre Anfrage"
        />
        <p v-if="errors.subject" class="mt-1 text-sm text-red-600 font-body">
          {{ errors.subject }}
        </p>
      </div>

      <!-- Message Field -->
      <div>
        <label for="message" class="block font-body font-normal text-sm tracking-wider text-vsg-blue-600 uppercase mb-2"> Nachricht * </label>
        <textarea
          id="message"
          v-model="message"
          required
          rows="5"
          maxlength="5000"
          :disabled="isSubmitting"
          :class="[
            'w-full px-4 py-3 bg-white border-2 rounded-xl font-body text-vsg-blue-900 transition-colors resize-y min-h-30',
            'focus:outline-none focus:border-vsg-gold-400',
            errors.message ? 'border-red-300' : 'border-vsg-blue-200',
            isSubmitting ? 'opacity-50 cursor-not-allowed' : '',
          ]"
          placeholder="Ihre Nachricht..."
        ></textarea>
        <p v-if="errors.message" class="mt-1 text-sm text-red-600 font-body">
          {{ errors.message }}
        </p>
        <p class="mt-1 text-xs text-vsg-blue-400 font-body">{{ message.length }} / 5000 Zeichen</p>
      </div>

      <!-- Submit Button -->
      <div class="pt-2">
        <button
          type="submit"
          :disabled="!isFormValid || isSubmitting"
          :class="[
            'w-full px-6 py-3 rounded-xl font-body font-medium text-lg transition-all',
            isFormValid && !isSubmitting
              ? 'bg-vsg-gold-400 text-vsg-blue-900 hover:bg-vsg-gold-500 cursor-pointer'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed',
          ]"
        >
          <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
            <FontAwesomeIcon icon="spinner" spin />
            Wird gesendet...
          </span>
          <span v-else>Nachricht senden</span>
        </button>
      </div>

      <p class="text-xs text-vsg-blue-400 font-body text-center">* Pflichtfelder</p>
    </form>
  </div>
</template>
