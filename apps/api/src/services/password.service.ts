import bcrypt from 'bcrypt'

export class PasswordService {
  private readonly saltRounds: number = 10

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds)
  }

  async verify(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }
}

export const passwordService = new PasswordService()
