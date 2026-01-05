import { ref } from 'vue';
import { defineStore } from 'pinia';
import type {
  DepartmentTrainingGroup,
  DepartmentTrainingSession,
  CreateDepartmentTrainingGroupDto,
  UpdateDepartmentTrainingGroupDto,
  CreateDepartmentTrainingSessionDto,
  UpdateDepartmentTrainingSessionDto,
} from '../types/department-extended.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useDepartmentTrainingStore = defineStore(
  'departmentTraining',
  () => {
    const trainingGroups = ref<DepartmentTrainingGroup[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    function setTrainingGroups(groups: DepartmentTrainingGroup[]): void {
      trainingGroups.value = [...groups].sort((a, b) => a.sort - b.sort);
      // Also sort sessions within each group
      trainingGroups.value.forEach((group) => {
        group.sessions.sort((a, b) => a.sort - b.sort);
      });
    }

    // ======== Training Groups ========

    async function createGroup(
      slug: string,
      data: CreateDepartmentTrainingGroupDto,
    ): Promise<DepartmentTrainingGroup | null> {
      isLoading.value = true;
      error.value = null;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/departments/${slug}/training-groups`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data),
          },
        );

        if (!response.ok) {
          throw new Error('Failed to create training group');
        }

        const newGroup = (await response.json()) as DepartmentTrainingGroup;
        trainingGroups.value.push(newGroup);
        trainingGroups.value.sort((a, b) => a.sort - b.sort);
        return newGroup;
      } catch (e) {
        error.value = e instanceof Error ? e.message : 'An error occurred';
        return null;
      } finally {
        isLoading.value = false;
      }
    }

    async function updateGroup(
      slug: string,
      groupId: number,
      data: UpdateDepartmentTrainingGroupDto,
    ): Promise<DepartmentTrainingGroup | null> {
      isLoading.value = true;
      error.value = null;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/departments/${slug}/training-groups/${groupId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data),
          },
        );

        if (!response.ok) {
          throw new Error('Failed to update training group');
        }

        const updatedGroup = (await response.json()) as DepartmentTrainingGroup;
        const index = trainingGroups.value.findIndex((g) => g.id === groupId);
        if (index !== -1) {
          trainingGroups.value[index] = updatedGroup;
        }
        return updatedGroup;
      } catch (e) {
        error.value = e instanceof Error ? e.message : 'An error occurred';
        return null;
      } finally {
        isLoading.value = false;
      }
    }

    async function deleteGroup(
      slug: string,
      groupId: number,
    ): Promise<boolean> {
      isLoading.value = true;
      error.value = null;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/departments/${slug}/training-groups/${groupId}`,
          {
            method: 'DELETE',
            credentials: 'include',
          },
        );

        if (!response.ok) {
          throw new Error('Failed to delete training group');
        }

        trainingGroups.value = trainingGroups.value.filter(
          (g) => g.id !== groupId,
        );
        return true;
      } catch (e) {
        error.value = e instanceof Error ? e.message : 'An error occurred';
        return false;
      } finally {
        isLoading.value = false;
      }
    }

    async function reorderGroups(
      slug: string,
      ids: number[],
    ): Promise<DepartmentTrainingGroup[] | null> {
      isLoading.value = true;
      error.value = null;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/departments/${slug}/training-groups/reorder`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ ids }),
          },
        );

        if (!response.ok) {
          throw new Error('Failed to reorder training groups');
        }

        const reorderedGroups =
          (await response.json()) as DepartmentTrainingGroup[];
        trainingGroups.value = reorderedGroups.sort((a, b) => a.sort - b.sort);
        return reorderedGroups;
      } catch (e) {
        error.value = e instanceof Error ? e.message : 'An error occurred';
        return null;
      } finally {
        isLoading.value = false;
      }
    }

    // ======== Training Sessions ========

    async function createSession(
      slug: string,
      groupId: number,
      data: CreateDepartmentTrainingSessionDto,
    ): Promise<DepartmentTrainingSession | null> {
      isLoading.value = true;
      error.value = null;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/departments/${slug}/training-groups/${groupId}/sessions`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data),
          },
        );

        if (!response.ok) {
          throw new Error('Failed to create training session');
        }

        const newSession = (await response.json()) as DepartmentTrainingSession;
        const group = trainingGroups.value.find((g) => g.id === groupId);
        if (group) {
          group.sessions.push(newSession);
          group.sessions.sort((a, b) => a.sort - b.sort);
        }
        return newSession;
      } catch (e) {
        error.value = e instanceof Error ? e.message : 'An error occurred';
        return null;
      } finally {
        isLoading.value = false;
      }
    }

    async function updateSession(
      slug: string,
      groupId: number,
      sessionId: number,
      data: UpdateDepartmentTrainingSessionDto,
    ): Promise<DepartmentTrainingSession | null> {
      isLoading.value = true;
      error.value = null;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/departments/${slug}/training-groups/${groupId}/sessions/${sessionId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data),
          },
        );

        if (!response.ok) {
          throw new Error('Failed to update training session');
        }

        const updatedSession =
          (await response.json()) as DepartmentTrainingSession;
        const group = trainingGroups.value.find((g) => g.id === groupId);
        if (group) {
          const sessionIndex = group.sessions.findIndex(
            (s) => s.id === sessionId,
          );
          if (sessionIndex !== -1) {
            group.sessions[sessionIndex] = updatedSession;
          }
        }
        return updatedSession;
      } catch (e) {
        error.value = e instanceof Error ? e.message : 'An error occurred';
        return null;
      } finally {
        isLoading.value = false;
      }
    }

    async function deleteSession(
      slug: string,
      groupId: number,
      sessionId: number,
    ): Promise<boolean> {
      isLoading.value = true;
      error.value = null;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/departments/${slug}/training-groups/${groupId}/sessions/${sessionId}`,
          {
            method: 'DELETE',
            credentials: 'include',
          },
        );

        if (!response.ok) {
          throw new Error('Failed to delete training session');
        }

        const group = trainingGroups.value.find((g) => g.id === groupId);
        if (group) {
          group.sessions = group.sessions.filter((s) => s.id !== sessionId);
        }
        return true;
      } catch (e) {
        error.value = e instanceof Error ? e.message : 'An error occurred';
        return false;
      } finally {
        isLoading.value = false;
      }
    }

    async function reorderSessions(
      slug: string,
      groupId: number,
      ids: number[],
    ): Promise<DepartmentTrainingSession[] | null> {
      isLoading.value = true;
      error.value = null;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/departments/${slug}/training-groups/${groupId}/sessions/reorder`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ ids }),
          },
        );

        if (!response.ok) {
          throw new Error('Failed to reorder training sessions');
        }

        const reorderedSessions =
          (await response.json()) as DepartmentTrainingSession[];
        const group = trainingGroups.value.find((g) => g.id === groupId);
        if (group) {
          group.sessions = reorderedSessions.sort((a, b) => a.sort - b.sort);
        }
        return reorderedSessions;
      } catch (e) {
        error.value = e instanceof Error ? e.message : 'An error occurred';
        return null;
      } finally {
        isLoading.value = false;
      }
    }

    function clearTrainingGroups(): void {
      trainingGroups.value = [];
      error.value = null;
    }

    return {
      trainingGroups,
      isLoading,
      error,
      setTrainingGroups,
      // Groups
      createGroup,
      updateGroup,
      deleteGroup,
      reorderGroups,
      // Sessions
      createSession,
      updateSession,
      deleteSession,
      reorderSessions,
      clearTrainingGroups,
    };
  },
);
