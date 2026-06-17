import { Router } from 'express';
import authRoutes from './auth.routes.js';
import articleRoutes from './article.routes.js';
import vocabularyRoutes from './vocabulary.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/articles', articleRoutes);
router.use('/vocabulary', vocabularyRoutes);

// Placeholder for future routes — will be added in later phases
// router.use('/users', userRoutes);
// router.use('/ielts', ieltsRoutes);
// router.use('/memberships', membershipRoutes);
// router.use('/payments', paymentRoutes);

export default router;
