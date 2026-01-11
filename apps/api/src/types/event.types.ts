import { Event as PrismaEvent } from '@/lib/prisma.lib';

export const EVENT_CATEGORIES = ['Meeting', 'Sport', 'Social', 'Other'] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export interface CreateEventDto {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  isFullDay?: boolean;
  location?: string;
  recurrence?: string;
  category: EventCategory;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isFullDay?: boolean;
  location?: string;
  recurrence?: string;
  category?: EventCategory;
}

export type Event = PrismaEvent;

export interface EventInstance extends Event {
  isRecurrenceInstance: boolean;
  originalEventId: number | null;
  instanceDate?: Date;
}

export interface EventsQueryParams {
  start: string;
  end: string;
  category?: EventCategory;
}
