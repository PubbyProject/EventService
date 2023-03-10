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

const getEventsByOrganizerId = async(req: Request, res: Response) => {
    const organizerId = req.params.organizerId;
    const events = await service.fetchEventsByOrganizerId(organizerId);
    if (events instanceof ErrorResponse) {
        return res.status(404).json({
            body: events.getError()
        });
    }

    return res.status(200).json({
        body: events
    });


}

const getPaginatedEvents = async (req: Request, res: Response) => {
    const params = req.query;
    if (params.offset === '' || params.limit === '') {
        return res.status(400).json({
            body: new ErrorResponse('Offset and/or limit are empty. Please try again.')
        })
    }

    const offset = Number(params.offset);
    const limit = Number(params.limit);
    if (isNaN(offset) || isNaN(limit)) {
        return res.status(400).json({
            body: new ErrorResponse('Offset and/or limit are not valid numbers. Please try again.')
        })
    }

    const events = await service.fetchPaginatedEvents(offset, limit);
    if (events instanceof ErrorResponse) {
        return res.status(500).json({
            body: events
        })
    }

    return res.status(200).json({
        body: events
    })
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

export default {getEvents, getEventById, getEventsByOrganizerId, getPaginatedEvents, addEvent, deleteEvent, updateEvent}