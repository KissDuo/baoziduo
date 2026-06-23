import { Router } from 'express';
import authRoutes from './auth.routes.js';
import articleRoutes from './article.routes.js';
import vocabularyRoutes from './vocabulary.routes.js';
import ieltsRoutes from './ielts.routes.js';

import videoRoutes from './video.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/articles', articleRoutes);
router.use('/vocabulary', vocabularyRoutes);
router.use('/ielts', ieltsRoutes);
router.use('/videos', videoRoutes);

// router.use('/users', userRoutes);
// router.use('/memberships', membershipRoutes);
// router.use('/payments', paymentRoutes);

export default router;
