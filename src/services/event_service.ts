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

    public async createEvent(event: EventInfo) {
        const startTime = new Date("2023-02-06T12:00:00Z")
        const endTime = new Date("2023-02-06T14:00:00Z")
        event.startTime = startTime;
        event.endTime = endTime;
        const hasEmptyProperties = !Object.values(event).every(o => o === null || o === '');
        if (hasEmptyProperties) {
            return new ErrorResponse('This event has one or more empty fields. Please fill in all fields.')
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