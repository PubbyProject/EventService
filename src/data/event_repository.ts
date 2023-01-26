import { PrismaClient } from "@prisma/client"
import EventInfo from "../entities/models/event";

export default class EventRepository {

    private prisma: PrismaClient

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient;
    }

    public async getAllEvents() {
        await this.prisma.$connect();
        const events = await this.prisma.event.findMany() as EventInfo[];
        this.prisma.$disconnect();

        return events;
    }

    public async getEventById(eventId: string) {
        await this.prisma.$connect();
        const event = await this.prisma.event.findUnique({
            where: {
                id: eventId
            }
        }) as EventInfo;
        this.prisma.$disconnect();

        return event;
    }

    public async createEvent(event: EventInfo) {
        await this.prisma.$connect();
        const result = await this.prisma.event.create({
            data: {
                name: event.name,
                description: event.description,
                organizer: event.organizer,
                startTime: event.startTime,
                endTime: event.endTime,
                entryPrice: event.entryPrice,
                maxCapacity: event.maxCapacity
            }
        })
        .then(async () => {
            await this.prisma.$disconnect();
            return event;
        }).catch(async (e: Error) => {
            await this.prisma.$disconnect()
            return new Error(e.message);
        });

        return result;
    }

    public async deleteEvent(eventId: string) {
        await this.prisma.$connect();

        const result = await this.prisma.event.delete({
            where: {
                id: eventId
            }
        })
        .then(async () => {
            await this.prisma.$disconnect();
            return eventId;
        })
        .catch(async (e: Error) => {
            await this.prisma.$disconnect();
            return new Error(e.message);
        });

        return result;
    }

    public async updateEvent(eventId: string, event: EventInfo) {
        await this.prisma.$connect();

        const result = await this.prisma.event.update({
            where: {
                id: eventId
            },
            data: {
                name: event.name || undefined,
                description: event.description || undefined,
                organizer: event.organizer || undefined,
                startTime: event.startTime || undefined,
                endTime: event.endTime || undefined,
                entryPrice: event.entryPrice || undefined,
                maxCapacity: event.maxCapacity || undefined
            }
        })
        .then(async () => {
            this.prisma.$disconnect();
            return event;
        })
        .catch(async (e: Error) => {
            return new Error(e.message);
        });

        return result;
    }
}