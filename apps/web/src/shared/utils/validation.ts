export interface ValidationRule {
  validate: (value: string) => string | null;
  message: string;
}

export function required(message = 'Dieses Feld ist erforderlich'): ValidationRule {
  return {
    validate: (value) => {
      if (!value || value.trim() === '') {
        return message;
      }
      return null;
    },
    message,
  };
}

export function email(message = 'Bitte eine gültige E-Mail-Adresse eingeben'): ValidationRule {
  return {
    validate: (value) => {
      if (!value || value.trim() === '') {
        return null;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return message;
      }
      return null;
    },
    message,
  };
}

export function minLength(min: number, message?: string): ValidationRule {
  const defaultMessage = `Dieses Feld muss mindestens ${min} Zeichen lang sein`;
  return {
    validate: (value) => {
      if (!value) {
        return null;
      }
      if (value.length < min) {
        return message || defaultMessage;
      }
      return null;
    },
    message: message || defaultMessage,
  };
}

export function maxLength(max: number, message?: string): ValidationRule {
  const defaultMessage = `Dieses Feld darf maximal ${max} Zeichen lang sein`;
  return {
    validate: (value) => {
      if (!value) {
        return null;
      }
      if (value.length > max) {
        return message || defaultMessage;
      }
      return null;
    },
    message: message || defaultMessage,
  };
}

export function length(min?: number, max?: number, message?: string): ValidationRule {
  return {
    validate: (value) => {
      if (!value) {
        return null;
      }
      if (min !== undefined && value.length < min) {
        return message || `Dieses Feld muss mindestens ${min} Zeichen lang sein`;
      }
      if (max !== undefined && value.length > max) {
        return message || `Dieses Feld darf maximal ${max} Zeichen lang sein`;
      }
      return null;
    },
    message: message || 'Ungültige Länge',
  };
}

export function validate(value: string, rules: ValidationRule[]): string[] {
  const errors: string[] = [];
  for (const rule of rules) {
    const error = rule.validate(value);
    if (error) {
      errors.push(error);
    }
  }
  return errors;
}
