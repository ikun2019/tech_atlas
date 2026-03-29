import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import {
  listCourses,
  getCourseDetail,
  createCourse,
  updateCourse,
  deleteCourse,
  addChapter,
  updateChapter,
  deleteChapter,
  addLesson,
  updateLesson,
  deleteLesson,
  getNotionOAuthUrl,
  notionOAuthCallback,
  disconnectNotion,
} from '../../controllers/instructor.controller.js';

const instructorRouter = Router();

instructorRouter.use(authenticate, authorize('INSTRUCTOR', 'ADMIN'));

instructorRouter.get('/instructor/courses', listCourses);
instructorRouter.get('/instructor/courses/:courseId', getCourseDetail);
instructorRouter.post('/instructor/courses', createCourse);
instructorRouter.put('/instructor/courses/:courseId', updateCourse);
instructorRouter.delete('/instructor/courses/:courseId', deleteCourse);
instructorRouter.post('/instructor/courses/:courseId/chapters', addChapter);
instructorRouter.put('/instructor/chapters/:chapterId', updateChapter);
instructorRouter.delete('/instructor/chapters/:chapterId', deleteChapter);
instructorRouter.post('/instructor/chapters/:chapterId/lessons', addLesson);
instructorRouter.put('/instructor/lessons/:lessonId', updateLesson);
instructorRouter.delete('/instructor/lessons/:lessonId', deleteLesson);
instructorRouter.get('/instructor/notion/oauth/url', getNotionOAuthUrl);
instructorRouter.post('/instructor/notion/oauth/callback', notionOAuthCallback);
instructorRouter.delete('/instructor/notion/token', disconnectNotion);

export default instructorRouter;
