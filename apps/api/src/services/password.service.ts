import bcrypt from 'bcrypt'

/**
 * Password Service
 * Handles password hashing and verification using bcrypt
 */
export class PasswordService {
  private readonly saltRounds: number = 10

  /**
   * Hash a plain text password
   * @param password - Plain text password to hash
   * @returns Hashed password
   */
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds)
  }

  /**
   * Verify a plain text password against a hashed password
   * @param password - Plain text password
   * @param hashedPassword - Hashed password to compare against
   * @returns True if passwords match, false otherwise
   */
  async verify(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }
}

// Export singleton instance
export const passwordService = new PasswordService()
