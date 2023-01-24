import express from 'express';
import controller from '../controllers/event_controller';
const router = express.Router();

router.get('/events/all', controller.getEvents);
router.post('/events/create', controller.addEvent);

export = router;