import { NotFoundException } from '@/errors/http-errors';
import { CreateEventDto, UpdateEventDto, Event, EventInstance, EventCategory } from '@/types/event.types';
import { Prisma, prisma } from '@/lib/prisma.lib';
import { RRule } from 'rrule';

export class EventsService {
  async findByDateRange(start: Date, end: Date, category?: EventCategory): Promise<EventInstance[]> {
    const where: Prisma.EventWhereInput = {
      OR: [
        // Non-recurring events that fall within the range
        {
          recurrence: null,
          startDate: { lte: end },
          endDate: { gte: start },
        },
        // Recurring events - we need to check if any occurrence falls within range
        // For recurring events, we fetch all that started before the end date
        {
          recurrence: { not: null },
          startDate: { lte: end },
        },
      ],
    };

    if (category) {
      where.category = category;
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { startDate: 'asc' },
    });

    const instances: EventInstance[] = [];

    for (const event of events) {
      if (!event.recurrence) {
        // Non-recurring event - add as single instance
        instances.push({
          ...event,
          isRecurrenceInstance: false,
          originalEventId: null,
        });
      } else {
        // Recurring event - expand occurrences
        const expandedInstances = this.expandRecurringEvent(event, start, end);
        instances.push(...expandedInstances);
      }
    }

    // Sort all instances by start date
    instances.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    return instances;
  }

  private expandRecurringEvent(event: Event, rangeStart: Date, rangeEnd: Date): EventInstance[] {
    const instances: EventInstance[] = [];

    try {
      // Parse the RRULE string
      const rule = RRule.fromString(`DTSTART:${this.formatDateForRRule(event.startDate)}\nRRULE:${event.recurrence}`);

      // Get occurrences within the date range
      const occurrences = rule.between(rangeStart, rangeEnd, true);

      // Calculate the duration of the original event
      const duration = new Date(event.endDate).getTime() - new Date(event.startDate).getTime();

      for (const occurrence of occurrences) {
        const instanceEndDate = new Date(occurrence.getTime() + duration);

        instances.push({
          ...event,
          startDate: occurrence,
          endDate: instanceEndDate,
          isRecurrenceInstance: true,
          originalEventId: event.id,
          instanceDate: occurrence,
        });
      }
    } catch {
      // If RRULE parsing fails, return the original event as a single instance
      instances.push({
        ...event,
        isRecurrenceInstance: false,
        originalEventId: null,
      });
    }

    return instances;
  }

  private formatDateForRRule(date: Date): string {
    // Format date as YYYYMMDDTHHMMSSZ for RRULE
    const d = new Date(date);
    return d
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');
  }

  async findById(id: number): Promise<Event> {
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const event = await prisma.event.create({
      data: {
        title: createEventDto.title,
        description: createEventDto.description,
        startDate: new Date(createEventDto.startDate),
        endDate: new Date(createEventDto.endDate),
        isFullDay: createEventDto.isFullDay ?? false,
        location: createEventDto.location,
        recurrence: createEventDto.recurrence,
        category: createEventDto.category,
      },
    });

    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto): Promise<Event> {
    // First check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    const updateData: Prisma.EventUpdateInput = {};

    if (updateEventDto.title !== undefined) {
      updateData.title = updateEventDto.title;
    }

    if (updateEventDto.description !== undefined) {
      updateData.description = updateEventDto.description;
    }

    if (updateEventDto.startDate !== undefined) {
      updateData.startDate = new Date(updateEventDto.startDate);
    }

    if (updateEventDto.endDate !== undefined) {
      updateData.endDate = new Date(updateEventDto.endDate);
    }

    if (updateEventDto.isFullDay !== undefined) {
      updateData.isFullDay = updateEventDto.isFullDay;
    }

    if (updateEventDto.location !== undefined) {
      updateData.location = updateEventDto.location;
    }

    if (updateEventDto.recurrence !== undefined) {
      updateData.recurrence = updateEventDto.recurrence;
    }

    if (updateEventDto.category !== undefined) {
      updateData.category = updateEventDto.category;
    }

    const event = await prisma.event.update({
      where: { id },
      data: updateData,
    });

    return event;
  }

  async remove(id: number): Promise<Event> {
    // First check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    const event = await prisma.event.delete({
      where: { id },
    });

    return event;
  }
}
