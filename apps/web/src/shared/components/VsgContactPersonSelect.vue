<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import {
  useContactPersonsStore,
  type ContactPerson,
} from '@/modules/admin/stores/contactPersonsStore';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  modelValue: number | null;
  excludeIds?: number[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void;
}>();

const contactPersonsStore = useContactPersonsStore();
const isOpen = ref(false);
const searchQuery = ref('');
const containerRef = ref<HTMLElement | null>(null);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

onMounted(async () => {
  if (contactPersonsStore.contactPersons.length === 0) {
    await contactPersonsStore.fetchContactPersons();
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', handleClickOutside);
});

function handleClickOutside(event: MouseEvent) {
  if (
    containerRef.value &&
    !containerRef.value.contains(event.target as Node)
  ) {
    isOpen.value = false;
  }
}

const filteredContactPersons = computed(() => {
  let persons = contactPersonsStore.contactPersons;

  // Filter out excluded IDs
  if (props.excludeIds && props.excludeIds.length > 0) {
    persons = persons.filter((p) => !props.excludeIds!.includes(p.id));
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    persons = persons.filter(
      (p) =>
        p.firstName.toLowerCase().includes(query) ||
        p.lastName.toLowerCase().includes(query),
    );
  }

  return persons;
});

const selectedPerson = computed(() => {
  if (!props.modelValue) return null;
  return (
    contactPersonsStore.contactPersons.find((p) => p.id === props.modelValue) ||
    null
  );
});

function selectPerson(person: ContactPerson) {
  emit('update:modelValue', person.id);
  isOpen.value = false;
  searchQuery.value = '';
}

function clearSelection() {
  emit('update:modelValue', null);
}

function getProfileImageUrl(person: ContactPerson): string | null {
  if (!person.profileImage) return null;
  return `${API_BASE_URL}/${person.profileImage.path}`;
}

// Reset search when dropdown closes
watch(isOpen, (open) => {
  if (!open) {
    searchQuery.value = '';
  }
});
</script>

<template>
  <div ref="containerRef" class="relative">
    <!-- Selected Value / Trigger -->
    <div
      class="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm cursor-pointer flex items-center justify-between"
      :class="{ 'border-vsg-blue-600': isOpen }"
      @click="isOpen = !isOpen"
    >
      <div v-if="selectedPerson" class="flex items-center gap-3">
        <img
          v-if="getProfileImageUrl(selectedPerson)"
          :src="getProfileImageUrl(selectedPerson)!"
          :alt="`${selectedPerson.firstName} ${selectedPerson.lastName}`"
          class="w-8 h-8 rounded-full object-cover"
        />
        <div
          v-else
          class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-medium"
        >
          {{ selectedPerson.firstName[0] }}{{ selectedPerson.lastName[0] }}
        </div>
        <span class="text-vsg-blue-900">
          {{ selectedPerson.firstName }} {{ selectedPerson.lastName }}
        </span>
      </div>
      <span v-else class="text-gray-400">Ansprechpartner auswählen...</span>

      <div class="flex items-center gap-2">
        <button
          v-if="selectedPerson"
          type="button"
          class="text-gray-400 hover:text-gray-600"
          @click.stop="clearSelection"
        >
          <FontAwesomeIcon icon="xmark" />
        </button>
        <FontAwesomeIcon
          icon="chevron-down"
          class="text-gray-400 transition-transform"
          :class="{ 'rotate-180': isOpen }"
        />
      </div>
    </div>

    <!-- Dropdown -->
    <div
      v-if="isOpen"
      class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden"
    >
      <!-- Search Input -->
      <div class="p-2 border-b border-gray-200">
        <input
          v-model="searchQuery"
          type="text"
          class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-vsg-blue-600"
          placeholder="Suchen..."
          @click.stop
        />
      </div>

      <!-- Options List -->
      <div class="overflow-y-auto max-h-48">
        <div
          v-if="filteredContactPersons.length === 0"
          class="px-4 py-3 text-sm text-gray-500 text-center"
        >
          Keine Ansprechpartner gefunden
        </div>
        <button
          v-for="person in filteredContactPersons"
          :key="person.id"
          type="button"
          class="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
          :class="{ 'bg-vsg-blue-50': person.id === modelValue }"
          @click="selectPerson(person)"
        >
          <img
            v-if="getProfileImageUrl(person)"
            :src="getProfileImageUrl(person)!"
            :alt="`${person.firstName} ${person.lastName}`"
            class="w-8 h-8 rounded-full object-cover"
          />
          <div
            v-else
            class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-medium"
          >
            {{ person.firstName[0] }}{{ person.lastName[0] }}
          </div>
          <div>
            <div class="text-sm text-vsg-blue-900">
              {{ person.firstName }} {{ person.lastName }}
            </div>
            <div class="text-xs text-gray-500">{{ person.type }}</div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
