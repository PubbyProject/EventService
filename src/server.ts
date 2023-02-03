import http from 'http';
import express, { Express } from 'express';
import morgan from 'morgan';
import routes from './routes/event_routes';
import { PrismaClient } from '@prisma/client';
import EventRepository from './data/event_repository';
import EventService from './services/event_service';
import RabbitMQService from './services/messaging/rabbitmq_service';

const router: Express = express();

const repository = new EventRepository(new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
}));
const service = new EventService(repository);

/** Logging */
router.use(morgan('dev'));

/** Parse the request */
router.use(express.urlencoded({ extended: false }));

/** Takes care of JSON data */
router.use(express.json());

/** RULES OF OUR API */
router.use((req, res, next) => {
    // set the CORS policy
    res.header('Access-Control-Allow-Origin', '*');
    // set the CORS headers
    res.header('Access-Control-Allow-Headers', 'origin, X-Requested-With,Content-Type,Accept, Authorization');
    // set the CORS method headers
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET PATCH DELETE POST');
        return res.status(200).json({});
    }
    next();
});

/** Routes */
router.use('/', routes);

/** Error handling */
router.use((req, res, next) => {
    const error = new Error('not found');
    return res.status(404).json({
        message: error.message
    });
});

/** Server */
const httpServer = http.createServer(router);
const PORT: any = process.env.PORT ?? 6060;
httpServer.listen(PORT, () => console.log(`The server is running on port ${PORT}`));

const rabbit = new RabbitMQService(String(process.env.RABBITMQ_URL), 'fetch-organizer-events-request-queue', service);
const conn = rabbit.CreateConnection();
rabbit.ConsumeMessage(conn);
