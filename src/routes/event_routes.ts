import express from 'express';
import controller from '../controllers/event_controller';
const router = express.Router();

router.get('/events', controller.getEvents);
router.get('/events/:id/details', controller.getEventById);
router.get('/events/organizer/:organizerId', controller.getEventsByOrganizerId);
router.get('/events/paginated', controller.getPaginatedEvents);
router.post('/events', controller.addEvent);
router.delete('/events/:id', controller.deleteEvent);
router.put('/events/:id', controller.updateEvent);

export = router;