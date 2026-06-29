import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import {
  registerEmailSchema,
  loginEmailSchema,
  sendSmsCodeSchema,
  loginSmsVerifySchema,
  sendEmailCodeSchema,
  forgotPasswordSchema,
} from '@english/shared';

const router = Router();

// Email auth
router.post('/email/send-code', validate(sendEmailCodeSchema), (req, res, next) =>
  authController.sendEmailCode(req, res, next)
);
router.post('/register/email', validate(registerEmailSchema), (req, res, next) =>
  authController.registerByEmail(req, res, next)
);
router.post('/login/email', validate(loginEmailSchema), (req, res, next) =>
  authController.loginByEmail(req, res, next)
);

// SMS auth
router.post('/sms/send', validate(sendSmsCodeSchema), (req, res, next) =>
  authController.sendSmsCode(req, res, next)
);
router.post('/login/sms/verify', validate(loginSmsVerifySchema), (req, res, next) =>
  authController.loginBySms(req, res, next)
);

// Forgot password
router.post('/forgot-password/send-code', validate(sendEmailCodeSchema), (req, res, next) =>
  authController.sendForgotPasswordCode(req, res, next)
);
router.post('/forgot-password/reset', validate(forgotPasswordSchema), (req, res, next) =>
  authController.resetPassword(req, res, next)
);

// Token management
router.post('/refresh', (req, res, next) => authController.refresh(req, res, next));
router.post('/logout', (req, res, next) => authController.logout(req, res, next));

export default router;
