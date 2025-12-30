import { prisma } from '@/lib/prisma.lib';
import { emailService } from '@/services/email.service';
import { NotFoundException } from '@/errors/http-errors';
import type { ContactFormDto } from '@/types/contact-form.types';

/**
 * Contact form service for processing form submissions
 */
class ContactFormService {
  /**
   * Process a contact form submission and send email to the contact person
   * @param data - The contact form data
   * @throws NotFoundError if contact person doesn't exist
   */
  async submitContactForm(data: ContactFormDto): Promise<void> {
    // Find the contact person
    const contactPerson = await prisma.contactPerson.findUnique({
      where: { id: data.contactPersonId },
    });

    if (!contactPerson) {
      throw new NotFoundException('Contact person not found');
    }

    // Send email to the contact person
    await emailService.sendContactFormEmail({
      to: contactPerson.email,
      senderName: data.senderName,
      senderEmail: data.senderEmail,
      subject: data.subject,
      message: data.message,
    });
  }
}

export const contactFormService = new ContactFormService();
