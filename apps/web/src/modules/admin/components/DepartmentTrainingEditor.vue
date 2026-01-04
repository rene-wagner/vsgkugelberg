<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { useDepartmentTrainingStore } from '../stores/departmentTrainingStore';
import TrainingGroupCard from './TrainingGroupCard.vue';
import type {
  DepartmentTrainingGroup,
  DepartmentTrainingSession,
  CreateDepartmentTrainingGroupDto,
  UpdateDepartmentTrainingGroupDto,
  CreateDepartmentTrainingSessionDto,
  UpdateDepartmentTrainingSessionDto,
} from '../types/department-extended.types';

interface LocalGroup extends DepartmentTrainingGroup {
  _isNew?: boolean;
  _tempId?: number;
}

interface LocalSession extends DepartmentTrainingSession {
  _isNew?: boolean;
  _tempId?: number;
}

const props = defineProps<{
  departmentSlug: string;
  initialGroups: DepartmentTrainingGroup[];
}>();

const trainingStore = useDepartmentTrainingStore();

// Local state
const localGroups = ref<LocalGroup[]>([]);

// Pending changes tracking
const pendingGroupCreates = ref<Map<number, LocalGroup>>(new Map());
const pendingGroupUpdates = ref<
  Map<
    number,
    {
      name: string;
      ageRange: string;
      icon: 'youth' | 'adults';
      variant: 'primary' | 'secondary';
      note: string | null;
    }
  >
>(new Map());
const pendingGroupDeletes = ref<Set<number>>(new Set());
const groupOrderChanged = ref(false);

// Session pending changes (keyed by groupId)
const pendingSessionCreates = ref<Map<number, LocalSession[]>>(new Map());
const pendingSessionUpdates = ref<
  Map<number, Map<number, { day: string; time: string }>>
>(new Map());
const pendingSessionDeletes = ref<Map<number, Set<number>>>(new Map());
const sessionOrderChanged = ref<Set<number>>(new Set());

let tempIdCounter = -1;

// Initialize from props
watch(
  () => props.initialGroups,
  (newGroups) => {
    localGroups.value = newGroups.map((g) => ({
      ...g,
      sessions: [...g.sessions].sort((a, b) => a.sort - b.sort),
    }));
    localGroups.value.sort((a, b) => a.sort - b.sort);

    // Clear all pending changes
    pendingGroupCreates.value.clear();
    pendingGroupUpdates.value.clear();
    pendingGroupDeletes.value.clear();
    groupOrderChanged.value = false;
    pendingSessionCreates.value.clear();
    pendingSessionUpdates.value.clear();
    pendingSessionDeletes.value.clear();
    sessionOrderChanged.value.clear();
  },
  { immediate: true },
);

// Computed: Display groups
const displayGroups = computed(() => {
  // Start with existing groups (not deleted)
  const existing = localGroups.value
    .filter((g) => !pendingGroupDeletes.value.has(g.id))
    .map((g) => {
      const pendingUpdate = pendingGroupUpdates.value.get(g.id);
      const updatedGroup = pendingUpdate ? { ...g, ...pendingUpdate } : g;

      // Process sessions for this group
      const deletedSessions =
        pendingSessionDeletes.value.get(g.id) || new Set();
      const sessionUpdates = pendingSessionUpdates.value.get(g.id) || new Map();
      const newSessions = pendingSessionCreates.value.get(g.id) || [];

      const existingSessions = updatedGroup.sessions
        .filter((s) => !deletedSessions.has(s.id))
        .map((s) => {
          const update = sessionUpdates.get(s.id);
          return update ? { ...s, ...update } : s;
        });

      return {
        ...updatedGroup,
        sessions: [...existingSessions, ...newSessions],
      };
    });

  // Add new groups
  const newGroups = Array.from(pendingGroupCreates.value.values());

  return [...existing, ...newGroups];
});

const isDirty = computed(() => {
  return (
    pendingGroupCreates.value.size > 0 ||
    pendingGroupUpdates.value.size > 0 ||
    pendingGroupDeletes.value.size > 0 ||
    groupOrderChanged.value ||
    pendingSessionCreates.value.size > 0 ||
    pendingSessionUpdates.value.size > 0 ||
    pendingSessionDeletes.value.size > 0 ||
    sessionOrderChanged.value.size > 0
  );
});

defineExpose({ isDirty });

// Group handlers
function handleAddGroup() {
  const tempId = tempIdCounter--;
  const newGroup: LocalGroup = {
    id: tempId,
    _tempId: tempId,
    _isNew: true,
    departmentId: 0,
    name: '',
    ageRange: '',
    icon: 'adults',
    variant: 'primary',
    note: null,
    sort: localGroups.value.length + pendingGroupCreates.value.size,
    sessions: [],
    createdAt: '',
    updatedAt: '',
  };
  pendingGroupCreates.value.set(tempId, newGroup);
}

function handleGroupUpdate(
  groupId: number,
  data: {
    name: string;
    ageRange: string;
    icon: 'youth' | 'adults';
    variant: 'primary' | 'secondary';
    note: string | null;
  },
  isNew: boolean,
) {
  if (isNew) {
    const group = pendingGroupCreates.value.get(groupId);
    if (group) {
      Object.assign(group, data);
    }
  } else {
    pendingGroupUpdates.value.set(groupId, data);
  }
}

function handleGroupDelete(groupId: number, isNew: boolean) {
  if (isNew) {
    pendingGroupCreates.value.delete(groupId);
    // Also remove any pending sessions for this group
    pendingSessionCreates.value.delete(groupId);
    pendingSessionUpdates.value.delete(groupId);
    pendingSessionDeletes.value.delete(groupId);
  } else {
    pendingGroupDeletes.value.add(groupId);
    pendingGroupUpdates.value.delete(groupId);
  }
}

function handleGroupsDragEnd() {
  groupOrderChanged.value = true;
}

// Session handlers
function handleAddSession(groupId: number, isNewGroup: boolean) {
  const tempId = tempIdCounter--;
  const newSession: LocalSession = {
    id: tempId,
    _tempId: tempId,
    _isNew: true,
    trainingGroupId: groupId,
    day: '',
    time: '',
    sort: 0,
    createdAt: '',
    updatedAt: '',
  };

  if (isNewGroup) {
    // Add to the group in pendingGroupCreates
    const group = pendingGroupCreates.value.get(groupId);
    if (group) {
      group.sessions = [...group.sessions, newSession];
      // Trigger reactivity by reassigning the Map
      pendingGroupCreates.value = new Map(pendingGroupCreates.value);
    }
  } else {
    // Add to pendingSessionCreates
    const existingSessions = pendingSessionCreates.value.get(groupId) || [];
    const newMap = new Map(pendingSessionCreates.value);
    newMap.set(groupId, [...existingSessions, newSession]);
    pendingSessionCreates.value = newMap;
  }
}

function handleSessionUpdate(
  groupId: number,
  sessionId: number,
  data: { day: string; time: string },
  isNewSession: boolean,
  isNewGroup: boolean,
) {
  if (isNewGroup) {
    const group = pendingGroupCreates.value.get(groupId);
    if (group) {
      const updatedSessions = group.sessions.map((s) => {
        if ((s as LocalSession)._tempId === sessionId) {
          return { ...s, day: data.day, time: data.time };
        }
        return s;
      });
      group.sessions = updatedSessions;
      // Trigger reactivity
      pendingGroupCreates.value = new Map(pendingGroupCreates.value);
    }
  } else if (isNewSession) {
    const sessions = pendingSessionCreates.value.get(groupId);
    if (sessions) {
      const updatedSessions = sessions.map((s) => {
        if (s._tempId === sessionId) {
          return { ...s, day: data.day, time: data.time };
        }
        return s;
      });
      const newMap = new Map(pendingSessionCreates.value);
      newMap.set(groupId, updatedSessions);
      pendingSessionCreates.value = newMap;
    }
  } else {
    const newMap = new Map(pendingSessionUpdates.value);
    const groupUpdates = newMap.get(groupId) || new Map();
    groupUpdates.set(sessionId, data);
    newMap.set(groupId, groupUpdates);
    pendingSessionUpdates.value = newMap;
  }
}

function handleSessionDelete(
  groupId: number,
  sessionId: number,
  isNewSession: boolean,
  isNewGroup: boolean,
) {
  if (isNewGroup) {
    const group = pendingGroupCreates.value.get(groupId);
    if (group) {
      group.sessions = group.sessions.filter(
        (s) => (s as LocalSession)._tempId !== sessionId,
      );
      // Trigger reactivity
      pendingGroupCreates.value = new Map(pendingGroupCreates.value);
    }
  } else if (isNewSession) {
    const sessions = pendingSessionCreates.value.get(groupId);
    if (sessions) {
      const filtered = sessions.filter((s) => s._tempId !== sessionId);
      const newMap = new Map(pendingSessionCreates.value);
      newMap.set(groupId, filtered);
      pendingSessionCreates.value = newMap;
    }
  } else {
    const newMap = new Map(pendingSessionDeletes.value);
    const groupDeletes = newMap.get(groupId) || new Set();
    groupDeletes.add(sessionId);
    newMap.set(groupId, groupDeletes);
    pendingSessionDeletes.value = newMap;
    // Remove any pending update for this session
    if (pendingSessionUpdates.value.has(groupId)) {
      const updateMap = new Map(pendingSessionUpdates.value);
      const groupUpdates = updateMap.get(groupId);
      if (groupUpdates) {
        groupUpdates.delete(sessionId);
      }
      pendingSessionUpdates.value = updateMap;
    }
  }
}

function handleSessionsReorder(groupId: number) {
  const newSet = new Set(sessionOrderChanged.value);
  newSet.add(groupId);
  sessionOrderChanged.value = newSet;
}

const isSaving = ref(false);
const saveError = ref<string | null>(null);

async function handleSave() {
  if (!isDirty.value) return;

  isSaving.value = true;
  saveError.value = null;

  try {
    // 1. Delete groups (cascades to sessions)
    for (const groupId of pendingGroupDeletes.value) {
      const success = await trainingStore.deleteGroup(
        props.departmentSlug,
        groupId,
      );
      if (!success)
        throw new Error('Fehler beim Löschen einer Trainingsgruppe');
    }

    // 2. Delete sessions from existing groups
    for (const [groupId, sessionIds] of pendingSessionDeletes.value) {
      if (pendingGroupDeletes.value.has(groupId)) continue; // Group already deleted
      for (const sessionId of sessionIds) {
        const success = await trainingStore.deleteSession(
          props.departmentSlug,
          groupId,
          sessionId,
        );
        if (!success)
          throw new Error('Fehler beim Löschen einer Trainingszeit');
      }
    }

    // 3. Create new groups with their sessions
    for (const [, group] of pendingGroupCreates.value) {
      if (!group.name.trim()) continue;

      const createDto: CreateDepartmentTrainingGroupDto = {
        name: group.name,
        ageRange: group.ageRange,
        icon: group.icon,
        variant: group.variant,
        note: group.note || undefined,
      };

      const createdGroup = await trainingStore.createGroup(
        props.departmentSlug,
        createDto,
      );
      if (!createdGroup)
        throw new Error('Fehler beim Erstellen einer Trainingsgruppe');

      // Create sessions for this new group
      for (const session of group.sessions) {
        if (!session.day || !session.time) continue;
        const sessionDto: CreateDepartmentTrainingSessionDto = {
          day: session.day,
          time: session.time,
        };
        const createdSession = await trainingStore.createSession(
          props.departmentSlug,
          createdGroup.id,
          sessionDto,
        );
        if (!createdSession)
          throw new Error('Fehler beim Erstellen einer Trainingszeit');
      }
    }

    // 4. Update existing groups
    for (const [groupId, data] of pendingGroupUpdates.value) {
      const updateDto: UpdateDepartmentTrainingGroupDto = {
        name: data.name,
        ageRange: data.ageRange,
        icon: data.icon,
        variant: data.variant,
        note: data.note,
      };
      const result = await trainingStore.updateGroup(
        props.departmentSlug,
        groupId,
        updateDto,
      );
      if (!result)
        throw new Error('Fehler beim Aktualisieren einer Trainingsgruppe');
    }

    // 5. Create new sessions for existing groups
    for (const [groupId, sessions] of pendingSessionCreates.value) {
      if (pendingGroupDeletes.value.has(groupId)) continue;
      for (const session of sessions) {
        if (!session.day || !session.time) continue;
        const sessionDto: CreateDepartmentTrainingSessionDto = {
          day: session.day,
          time: session.time,
        };
        const result = await trainingStore.createSession(
          props.departmentSlug,
          groupId,
          sessionDto,
        );
        if (!result)
          throw new Error('Fehler beim Erstellen einer Trainingszeit');
      }
    }

    // 6. Update existing sessions
    for (const [groupId, sessionUpdates] of pendingSessionUpdates.value) {
      if (pendingGroupDeletes.value.has(groupId)) continue;
      for (const [sessionId, data] of sessionUpdates) {
        const updateDto: UpdateDepartmentTrainingSessionDto = {
          day: data.day,
          time: data.time,
        };
        const result = await trainingStore.updateSession(
          props.departmentSlug,
          groupId,
          sessionId,
          updateDto,
        );
        if (!result)
          throw new Error('Fehler beim Aktualisieren einer Trainingszeit');
      }
    }

    // 7. Reorder groups if changed
    if (groupOrderChanged.value) {
      const existingIds = displayGroups.value
        .filter((g) => !g._isNew)
        .map((g) => g.id);
      if (existingIds.length > 0) {
        const result = await trainingStore.reorderGroups(
          props.departmentSlug,
          existingIds,
        );
        if (!result)
          throw new Error('Fehler beim Sortieren der Trainingsgruppen');
      }
    }

    // 8. Reorder sessions within groups
    for (const groupId of sessionOrderChanged.value) {
      if (pendingGroupDeletes.value.has(groupId)) continue;
      const group = displayGroups.value.find((g) => g.id === groupId);
      if (group) {
        const sessionIds = group.sessions
          .filter((s) => !(s as LocalSession)._isNew)
          .map((s) => s.id);
        if (sessionIds.length > 0) {
          const result = await trainingStore.reorderSessions(
            props.departmentSlug,
            groupId,
            sessionIds,
          );
          if (!result)
            throw new Error('Fehler beim Sortieren der Trainingszeiten');
        }
      }
    }

    // Reset all pending state
    pendingGroupCreates.value.clear();
    pendingGroupUpdates.value.clear();
    pendingGroupDeletes.value.clear();
    groupOrderChanged.value = false;
    pendingSessionCreates.value.clear();
    pendingSessionUpdates.value.clear();
    pendingSessionDeletes.value.clear();
    sessionOrderChanged.value.clear();

    // Refresh from store
    localGroups.value = [...trainingStore.trainingGroups];
  } catch (e) {
    saveError.value =
      e instanceof Error ? e.message : 'Ein Fehler ist aufgetreten';
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Error Message -->
    <div
      v-if="saveError"
      class="bg-red-50 border border-red-200 rounded-xl p-4"
    >
      <p class="text-sm text-red-600 font-body">{{ saveError }}</p>
    </div>

    <!-- Empty State -->
    <div
      v-if="displayGroups.length === 0"
      class="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300"
    >
      <svg
        class="w-12 h-12 text-gray-400 mx-auto mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p class="text-gray-500 font-body mb-4">
        Noch keine Trainingsgruppen vorhanden.
      </p>
      <button
        type="button"
        class="px-4 py-2 bg-vsg-blue-600 text-white font-body text-sm rounded-lg hover:bg-vsg-blue-700 transition-colors"
        @click="handleAddGroup"
      >
        Erste Trainingsgruppe hinzufügen
      </button>
    </div>

    <!-- Groups List -->
    <template v-else>
      <VueDraggable
        v-model="displayGroups"
        :animation="200"
        handle=".group-drag-handle"
        ghost-class="opacity-50"
        class="space-y-4"
        @end="handleGroupsDragEnd"
      >
        <TrainingGroupCard
          v-for="group in displayGroups"
          :key="group.id"
          :group="group"
          :is-new="!!group._isNew"
          @update="
            (data) =>
              handleGroupUpdate(group._tempId || group.id, data, !!group._isNew)
          "
          @delete="handleGroupDelete(group._tempId || group.id, !!group._isNew)"
          @session-add="
            handleAddSession(group._tempId || group.id, !!group._isNew)
          "
          @session-update="
            (sessionId, data, isNewSession) =>
              handleSessionUpdate(
                group._tempId || group.id,
                sessionId,
                data,
                isNewSession,
                !!group._isNew,
              )
          "
          @session-delete="
            (sessionId, isNewSession) =>
              handleSessionDelete(
                group._tempId || group.id,
                sessionId,
                isNewSession,
                !!group._isNew,
              )
          "
          @sessions-reorder="handleSessionsReorder(group.id)"
        />
      </VueDraggable>

      <!-- Add Group Button -->
      <button
        type="button"
        class="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-vsg-blue-400 hover:text-vsg-blue-600 transition-colors font-body text-sm flex items-center justify-center gap-2"
        @click="handleAddGroup"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
        Trainingsgruppe hinzufügen
      </button>
    </template>

    <!-- Save Button -->
    <div v-if="isDirty" class="flex justify-end pt-4 border-t border-gray-200">
      <button
        type="button"
        class="px-8 py-2.5 bg-vsg-blue-600 text-white font-display text-sm tracking-wider rounded-lg hover:bg-vsg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isSaving"
        @click="handleSave"
      >
        {{ isSaving ? 'SPEICHERN...' : 'SPEICHERN' }}
      </button>
    </div>
  </div>
</template>
