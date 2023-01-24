import { PrismaClient } from "@prisma/client"
import Event from "../entities/event";

export default class EventRepository {

    private prisma: PrismaClient

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient;
    }

    public async createEvent(event: Event) {
        console.log(`Event in repo: ${event}`)
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
    };

    public async getAllEvents() {
        await this.prisma.$connect();
        const events = await this.prisma.event.findMany();

        return events;
    }
}