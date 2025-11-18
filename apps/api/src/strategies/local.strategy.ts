import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { PrismaClient } from '@prisma/client';
import { AuthService } from '@/services/auth.service';
import { passwordService } from '@/services/password.service';

const prisma = new PrismaClient();
const authService = new AuthService(prisma, passwordService);

passport.use(
  /* eslint-disable-next-line @typescript-eslint/no-misused-promises */
  new LocalStrategy(async (usernameOrEmail, password, done) => {
    try {
      const user = await authService.validateUser(usernameOrEmail, password);

      if (!user) {
        return done(null, false, { message: 'Invalid credentials' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }),
);

export { passport };
