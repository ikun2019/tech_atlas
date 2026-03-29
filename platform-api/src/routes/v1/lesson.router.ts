import { Router } from 'express';
import { optionalAuthenticate } from '../../middlewares/optionalAuthenticate.js';
import { getLesson } from '../../controllers/lesson.controller.js';

const lessonRouter = Router();

lessonRouter.get('/lessons/:lessonId', optionalAuthenticate, getLesson);

export default lessonRouter;
