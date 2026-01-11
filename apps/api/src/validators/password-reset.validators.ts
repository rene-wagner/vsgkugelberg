import { body } from 'express-validator';

/**
 * Validator for POST /auth/forgot-password
 */
export const forgotPasswordValidator = [
  body('email').trim().notEmpty().withMessage('E-Mail ist erforderlich').isEmail().withMessage('Ungueltige E-Mail-Adresse').normalizeEmail(),
];

/**
 * Validator for POST /auth/reset-password
 * Reuses password rules from user.validators.ts for consistency
 */
export const resetPasswordValidator = [
  body('token').trim().notEmpty().withMessage('Token ist erforderlich').isLength({ min: 64, max: 64 }).withMessage('Ungueltiges Token-Format'),

  body('password')
    .notEmpty()
    .withMessage('Passwort ist erforderlich')
    .isLength({ min: 8 })
    .withMessage('Passwort muss mindestens 8 Zeichen lang sein')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Passwort muss mindestens einen Kleinbuchstaben, einen Grossbuchstaben und eine Zahl enthalten'),
];
