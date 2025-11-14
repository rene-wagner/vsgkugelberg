import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  private readonly saltRounds: number;

  constructor() {
    // Default to 10 salt rounds, configurable via environment variable
    this.saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
  }

  /**
   * Hash a plain text password using bcrypt
   * @param password - Plain text password to hash
   * @returns Promise resolving to the hashed password
   */
  async hash(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.saltRounds);
    } catch {
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Compare a plain text password with a hashed password
   * @param password - Plain text password
   * @param hash - Hashed password to compare against
   * @returns Promise resolving to true if passwords match, false otherwise
   */
  async compare(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch {
      throw new Error('Failed to compare passwords');
    }
  }
}
