import { Router } from 'express';
import authRouter from './auth.router.js';
import courseRouter from './course.router.js';
import lessonRouter from './lesson.router.js';
import progressRouter from './progress.router.js';
import subscriptionRouter from './subscription.router.js';
import webhookRouter from './webhook.router.js';
import instructorRouter from './instructor.router.js';
import adminRouter from './admin.router.js';

const v1Router = Router();

v1Router.use('/auth', authRouter);
v1Router.use('/', courseRouter);
v1Router.use('/', lessonRouter);
v1Router.use('/', progressRouter);
v1Router.use('/', subscriptionRouter);
v1Router.use('/', webhookRouter);
v1Router.use('/', instructorRouter);
v1Router.use('/', adminRouter);

export default v1Router;
