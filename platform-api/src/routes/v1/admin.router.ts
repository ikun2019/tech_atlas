import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import {
  listUsers,
  changeRole,
  listCourses,
  publishCourse,
  getStats,
} from '../../controllers/admin.controller.js';

const adminRouter = Router();

adminRouter.use(authenticate, authorize('ADMIN'));

adminRouter.get('/admin/users', listUsers);
adminRouter.patch('/admin/users/:userId/role', changeRole);
adminRouter.get('/admin/courses', listCourses);
adminRouter.put('/admin/courses/:courseId/publish', publishCourse);
adminRouter.get('/admin/stats', getStats);

export default adminRouter;
