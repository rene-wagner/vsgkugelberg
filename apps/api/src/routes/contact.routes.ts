import { Router, type Request, type Response } from 'express';
import { asyncHandlerMiddleware } from '@/middleware/async-handler.middleware';
import { validationMiddleware } from '@/middleware/validation.middleware';
import { contactFormValidator } from '@/validators/contact-form.validators';
import { contactFormLimiter } from '@/middleware/rate-limit.middleware';
import {
  honeypotMiddleware,
  isSpamRequest,
  encryptTimestamp,
} from '@/middleware/honeypot.middleware';
import { contactFormService } from '@/services/contact-form.service';
import type { ContactFormDto } from '@/types/contact-form.types';
import type { TypedRequest } from '@/types/express.d';

const router = Router();

// Request body type for contact form
interface ContactFormRequestBody {
  contactPersonId: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
  website?: string;
  timestamp: string;
}

/**
 * GET /api/contact/token
 * Generate an encrypted timestamp token for the contact form honeypot
 * This token must be included when submitting the form
 */
router.get('/token', (_req: Request, res: Response) => {
  const token = encryptTimestamp();
  res.json({ token });
});

/**
 * POST /api/contact
 * Submit a contact form message
 * Public endpoint with honeypot protection and rate limiting
 */
router.post(
  '/',
  contactFormLimiter,
  honeypotMiddleware,
  contactFormValidator,
  validationMiddleware,
  asyncHandlerMiddleware(
    async (req: TypedRequest<ContactFormRequestBody>, res: Response) => {
      // If honeypot detected spam, return success silently (don't send email)
      if (isSpamRequest(req)) {
        return res.status(200).json({
          message: 'Ihre Nachricht wurde erfolgreich gesendet.',
        });
      }

      const formData: ContactFormDto = {
        contactPersonId: parseInt(req.body.contactPersonId, 10),
        senderName: req.body.senderName,
        senderEmail: req.body.senderEmail,
        subject: req.body.subject,
        message: req.body.message,
        website: req.body.website,
        timestamp: req.body.timestamp,
      };

      await contactFormService.submitContactForm(formData);

      res.status(200).json({
        message: 'Ihre Nachricht wurde erfolgreich gesendet.',
      });
    },
  ),
);

export { router as contactRouter };
