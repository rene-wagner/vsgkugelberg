import { ref } from 'vue';
import { defineStore } from 'pinia';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

  async function fetchEvents(
    start: string,
    end: string,
    category?: EventCategory,
  ): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      let url = `${API_BASE_URL}/api/events?start=${start}&end=${end}`;
      if (category) {
        url += `&category=${category}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      events.value = (await response.json()) as EventItem[];
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchEvent(id: number): Promise<EventItem | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch event');
      }

      return (await response.json()) as EventItem;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function createEvent(data: CreateEventData): Promise<EventItem | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      const newEvent = (await response.json()) as EventItem;
      events.value.push(newEvent);
      return newEvent;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateEvent(
    id: number,
    data: UpdateEventData,
  ): Promise<EventItem | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      const updatedEvent = (await response.json()) as EventItem;
      const index = events.value.findIndex((e) => e.id === id);
      if (index !== -1) {
        events.value[index] = updatedEvent;
      }
      return updatedEvent;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteEvent(id: number): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      events.value = events.value.filter((e) => e.id !== id);
      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
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
