import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction} from 'express';
import EventRepository from "../data/event_repository";
import Event from "../entities/event";
import EventService from "../services/event_service";

const repository = new EventRepository(new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
}));
const service = new EventService(repository);

const getEvents = async (req: Request, res: Response, next: NextFunction) => {


    let events = await service.fetchAllEvents();
    return res.status(200).json({
        body: events
    });
};

const addEvent = async (req: Request, res: Response, next: NextFunction) => {
    let event = req.body as Event;
    console.log(`Event in controller: ${event}`)

    const result: any = await service.createEvent(event);
    console.log(`Result: ${result}`)
    if (result instanceof String) {
        return res.status(400).json({
            body: result
        })
    }
    return res.status(200).json({
        body: "Event has been successfully created!"
    });
};

export default {getEvents, addEvent}
