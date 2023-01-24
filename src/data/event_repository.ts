import { PrismaClient } from "@prisma/client"
import Event from "../entities/event";

export default class EventRepository {

    private prisma: PrismaClient

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient;
    }

    public async getAllEvents() {
        await this.prisma.$connect();
        const events = await this.prisma.event.findMany();
        this.prisma.$disconnect();

        return events;
    }

    public async getEventById(eventId: string) {
        await this.prisma.$connect();
        const event = await this.prisma.event.findUnique({
            where: {
                id: eventId
            }
        });
        this.prisma.$disconnect();

        return event;
    }

    public async createEvent(event: Event) {
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
        }).catch(async (e) => {
            await this.prisma.$disconnect()
            return Error(e.message)
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
        })
        .catch(async (e) => {
            await this.prisma.$disconnect();
            return Error(e.message)
        });

        return result;
    }

    public async updateEvent(eventId: string, event: Event) {
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
        })
        .catch(async (e) => {
            return Error(e.message);
        });

        return result;
    }
}