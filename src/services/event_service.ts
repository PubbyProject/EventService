import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import EventRepository from "../data/event_repository";
import ErrorResponse from "../entities/errors/error_response";
import EventInfo from "../entities/models/event";

export default class EventService {
    private repository: EventRepository;

    constructor(repository: EventRepository) {
        this.repository = repository;
    }

    public async fetchAllEvents() {
        const events = await this.repository.getAllEvents();
        return events;
    }

    public async fetchEventById(eventId: string) {
        const event = await this.repository.getEventById(eventId).catch(async (e: PrismaClientKnownRequestError) => {
            return new ErrorResponse('Malformed ID. Please use a valid ID.');
        });

        if(event === null) {
            return new ErrorResponse('Event not found');
        }

        return event;
    }

    public async fetchPaginatedEvents(offset: number, limit: number) {
        const events = await this.repository.getPaginatedEvents(offset, limit)
        .catch(async (e: PrismaClientKnownRequestError) => {
            return new ErrorResponse('Something went wrong. Please try again.')
        });
        return events;
    }

    public async createEvent(event: EventInfo) {
        const hasEmptyProperties = Object.entries(event)
        .filter(([key, value]) => key !== 'id' && (value === null || value === ''))
        .length > 0;
      
      if (hasEmptyProperties) {
        return new ErrorResponse('This event has one or more empty fields. Please fill in all fields.');
      }
        const result = await this.repository.createEvent(event);
        if (result instanceof Error) {
            return new ErrorResponse(result.message);
        }

        return result;
    }

    public async deleteEvent(eventId: string) {
        const foundEvent = await this.fetchEventById(eventId);
        if (foundEvent instanceof ErrorResponse ) {
            return foundEvent as ErrorResponse;
        }

        const result = await this.repository.deleteEvent(eventId);
        if (result instanceof Error) {
            return new ErrorResponse(result.message);
        }

        return foundEvent;
    }

    public async updateEvent(eventId: string, event: EventInfo) {
        const foundEvent = await this.fetchEventById(eventId);
        if (foundEvent instanceof ErrorResponse) {
            return foundEvent as ErrorResponse;
        }

        const result = await this.repository.updateEvent(eventId, event);
        if (result instanceof Error) {
            return new ErrorResponse(result.message);
        }

        return result;
    }
}