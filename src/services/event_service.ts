import EventRepository from "../data/event_repository";
import Event from "../entities/event";

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
        const event = await this.repository.getEventById(eventId);
        if(event === null) {
            return { error: 'Event not found.' }
        }

        return event;
    }

    public async createEvent(event: Event) {
        const startTime = new Date("2023-02-06T12:00:00Z")
        const endTime = new Date("2023-02-06T14:00:00Z")
        event.startTime = startTime;
        event.endTime = endTime;
        const result = await this.repository.createEvent(event);
        if (result instanceof Error) {
            return result.message;
        }

        return result;
    }
}