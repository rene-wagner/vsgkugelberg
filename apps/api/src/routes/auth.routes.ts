import { Router } from 'express'
import passport from 'passport'
import { PrismaClient } from '@prisma/client'
import { AuthService, UserPayload } from '@/services/auth.service'
import { passwordService } from '@/services/password.service'
import { asyncHandlerMiddleware } from '@/middleware/async-handler.middleware'
import '@/strategies/local.strategy'

const router = Router()
const prisma = new PrismaClient()
const authService = new AuthService(prisma, passwordService)

router.post(
  '/login',
  passport.authenticate('local', { session: false }),
  asyncHandlerMiddleware(async (req, res) => {
    const user = req.user as UserPayload

    const { access_token, user: userData } = authService.login(user)

    // Set JWT in httpOnly cookie
    res.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour
    })

    res.json({ user: userData })
  }),
)

router.post('/logout', (req, res) => {
  res.clearCookie('access_token')
  res.json({ message: 'Logged out successfully' })
})

export { router as authRouter }
