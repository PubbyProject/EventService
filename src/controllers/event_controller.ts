import { PrismaClient } from '@prisma/client';
import { Request, Response} from 'express';
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

const getEvents = async (req: Request, res: Response) => {
    let events = await service.fetchAllEvents();
    return res.status(200).json({
        body: events
    });
};

const getEventById = async (req: Request, res: Response) => {
    let event = await service.fetchEventById(req.params.id)
    if (event.hasOwnProperty('error')) {
        return res.status(404).json({
            body: 'Event not found.'
        })
    };

    return res.status(200).json({
        body: event
    });
};

const addEvent = async (req: Request, res: Response) => {
    let event = req.body as Event;

    const result: any = await service.createEvent(event);
    if (result instanceof String) {
        return res.status(400).json({
            body: result
        })
    }
    return res.status(201).json({
        body: "Event has been successfully created!"
    });
};

const deleteEvent = async(req: Request, res: Response) => {
    const result: any = await service.deleteEvent(req.params.id)
    if (result.hasOwnProperty('error')) {
        return res.status(404).json({
            body: "Event with this ID was not found. Please try again with another ID."
        })
    }

    return res.status(200).json({
        body: "Event successfully deleted."
    })
};

const updateEvent = async(req: Request, res: Response) => {
    let event = req.body as Event;
    const result: any = await service.updateEvent(req.params.id, event)
    if (result instanceof String) {
        return res.status(400).json({
            body: result
        })
    }

    return res.status(200).json({
        body: event
    });
}

export default {getEvents, getEventById, addEvent, deleteEvent, updateEvent}