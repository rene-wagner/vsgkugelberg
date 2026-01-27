import { Router } from 'express';
import passport from 'passport';
import { AuthService, UserPayload } from '@/services/auth.service';
import { passwordService } from '@/services/password.service';
import { asyncHandlerMiddleware } from '@/middleware/async-handler.middleware';
import { validationMiddleware } from '@/middleware/validation.middleware';
import { loginLimiter, logoutLimiter, forgotPasswordLimiter, resetPasswordLimiter } from '@/middleware/rate-limit.middleware';
import { forgotPasswordValidator, resetPasswordValidator } from '@/validators/password-reset.validators';
import '@/strategies/local.strategy';

const router = Router();
const authService = new AuthService(passwordService);

router.post(
  '/login',
  loginLimiter,
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-argument */
  passport.authenticate('local', { session: false }),
  asyncHandlerMiddleware(async (req, res) => {
    // Passport local strategy sets full UserPayload on req.user
    const user = req.user as UserPayload;

    const { access_token, user: userData } = authService.login(user);

    // Set JWT in httpOnly cookie
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour
    });

    res.json({ user: userData });
  }),
);

router.post('/logout', logoutLimiter, (_req, res) => {
  res.clearCookie('access_token');
  res.json({ message: 'Logged out successfully' });
});

/**
 * POST /auth/forgot-password
 * Initiate password reset. Always returns success to prevent user enumeration.
 */
router.post(
  '/forgot-password',
  forgotPasswordLimiter,
  forgotPasswordValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { email } = req.body as { email: string };

    await authService.requestPasswordReset(email);

    // Always return success to prevent user enumeration
    res.json({
      message: 'Falls ein Konto mit dieser E-Mail existiert, wurde eine E-Mail gesendet.',
    });
  }),
);

/**
 * POST /auth/reset-password
 * Complete password reset with valid token.
 */
router.post(
  '/reset-password',
  resetPasswordLimiter,
  resetPasswordValidator,
  validationMiddleware,
  asyncHandlerMiddleware(async (req, res) => {
    const { token, password } = req.body as { token: string; password: string };

    const result = await authService.resetPassword(token, password);

    if (!result.success) {
      const errorMessages: Record<string, string> = {
        invalid: 'Ungueltiger oder abgelaufener Link.',
        expired: 'Der Link ist abgelaufen. Bitte fordere einen neuen an.',
        used: 'Dieser Link wurde bereits verwendet.',
      };

      return res.status(400).json({
        message: errorMessages[result.error!] || 'Ein Fehler ist aufgetreten.',
      });
    }

    res.json({
      message: 'Passwort erfolgreich zurueckgesetzt.',
    });
  }),
);

export { router as authRouter };
