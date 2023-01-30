import { PrismaClient } from '@prisma/client';
import { Request, Response} from 'express';
import EventRepository from "../data/event_repository";
import EventInfo from "../entities/models/event";
import EventService from "../services/event_service";
import ErrorResponse from '../entities/errors/error_response';

const repository = new EventRepository(new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
}));
const service = new EventService(repository);

const getEvents = async (req: Request, res: Response) => {
    const params = req.params;
    if (params.offset !== '' || params.limit !== '') {
        const offset = Number(params.offset);
        const limit = Number(params.limit)
        if (isNaN(offset) || isNaN(limit)) {
            return res.status(400).json({
                body: new ErrorResponse('One of your parameters is not a number. Please try again.').getError()
            });
        }
        let eventsPaginated = await service.fetchPaginatedEvents(Number(params.offset), Number(params.limit))
        return res.status(200).json({
            body: eventsPaginated
        });
    }

    let events = await service.fetchAllEvents();
    return res.status(200).json({
        body: events
    });
};

const getEventById = async (req: Request, res: Response) => {
    let event = await service.fetchEventById(req.params.id)
    if (event instanceof ErrorResponse) {
        return res.status(404).json({
            body: event.getError()
        })
    };

    return res.status(200).json({
        body: event
    });
};

const addEvent = async (req: Request, res: Response) => {
    let event = req.body as EventInfo;

    const result = await service.createEvent(event);
    if (result instanceof ErrorResponse) {
        return res.status(400).json({
            body: result.getError()
        })
    }
    return res.status(201).json({
        body: "Event has been successfully created!"
    });
};

const deleteEvent = async(req: Request, res: Response) => {
    const result = await service.deleteEvent(req.params.id)
    if (result !instanceof String) {
        return res.status(404).json({
            body: result as ErrorResponse
        })
    }

    return res.status(200).json({
        body: "Event successfully deleted."
    })
};

const updateEvent = async(req: Request, res: Response) => {
    let event = req.body as EventInfo;
    const result = await service.updateEvent(req.params.id, event)
    if (result instanceof ErrorResponse) {
        return res.status(400).json({
            body: result.getError()
        })
    }

    return res.status(200).json({
        body: result
    });
}

export default {getEvents, getEventById, addEvent, deleteEvent, updateEvent}