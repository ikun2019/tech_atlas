import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { getUserProgress, getCourseProgress } from '../../controllers/progress.controller.js';

const progressRouter = Router();

progressRouter.get('/progress', authenticate, getUserProgress);
progressRouter.get('/progress/courses/:courseId', authenticate, getCourseProgress);

export default progressRouter;
