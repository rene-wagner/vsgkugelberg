import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api, ApiError } from '@shared/utils/api';

export type EventCategory = 'Meeting' | 'Sport' | 'Social' | 'Other';

export interface EventItem {
  id: number;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string;
  isFullDay: boolean;
  location: string | null;
  recurrence: string | null;
  category: EventCategory;
  createdAt: string;
  updatedAt: string;
  isRecurrenceInstance?: boolean;
  originalEventId?: number | null;
}

export interface CreateEventData {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  isFullDay?: boolean;
  location?: string;
  recurrence?: string;
  category: EventCategory;
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isFullDay?: boolean;
  location?: string;
  recurrence?: string;
  category?: EventCategory;
}

export const useEventsStore = defineStore('events', () => {
  const events = ref<EventItem[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchEvents(start: string, end: string, category?: EventCategory): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      let query = `?start=${start}&end=${end}`;
      if (category) {
        query += `&category=${category}`;
      }

      events.value = await api.get<EventItem[]>(`/api/events${query}`);
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchEvent(id: number): Promise<EventItem | null> {
    isLoading.value = true;
    error.value = null;

    try {
      return await api.get<EventItem>(`/api/events/${id}`);
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function createEvent(data: CreateEventData): Promise<EventItem | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const newEvent = await api.post<EventItem>('/api/events', data);
      events.value.push(newEvent);
      return newEvent;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateEvent(id: number, data: UpdateEventData): Promise<EventItem | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const updatedEvent = await api.patch<EventItem>(`/api/events/${id}`, data);
      const index = events.value.findIndex((e) => e.id === id);
      if (index !== -1) {
        events.value[index] = updatedEvent;
      }
      return updatedEvent;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteEvent(id: number): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      await api.delete(`/api/events/${id}`);
      events.value = events.value.filter((e) => e.id !== id);
      return true;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    events,
    isLoading,
    error,
    fetchEvents,
    fetchEvent,
    createEvent,
    updateEvent,
    deleteEvent,
  };
});
