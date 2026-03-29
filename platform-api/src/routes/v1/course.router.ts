import { Router } from 'express';
import { optionalAuthenticate } from '../../middlewares/optionalAuthenticate.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import {
  listCategories,
  listCourses,
  getCourse,
  getChapters,
  markComplete,
  unmarkComplete,
  purgeCache,
} from '../../controllers/course.controller.js';

const courseRouter = Router();

courseRouter.get('/categories', listCategories);
courseRouter.get('/courses', optionalAuthenticate, listCourses);
courseRouter.get('/courses/:id', optionalAuthenticate, getCourse);
courseRouter.get('/courses/:id/chapters', optionalAuthenticate, getChapters);
courseRouter.post('/lessons/:id/complete', authenticate, markComplete);
courseRouter.delete('/lessons/:id/complete', authenticate, unmarkComplete);
courseRouter.post(
  '/lessons/:id/cache/purge',
  authenticate,
  authorize('INSTRUCTOR', 'ADMIN'),
  purgeCache,
);

export default courseRouter;
