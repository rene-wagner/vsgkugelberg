import { Router } from 'express'
import { authRouter } from './auth.routes'
import { usersRouter } from './users.routes'
import { postsRouter } from './posts.routes'
import { categoriesRouter } from './categories.routes'

const router = Router()

router.use('/auth', authRouter)
router.use('/users', usersRouter)
router.use('/posts', postsRouter)
router.use('/categories', categoriesRouter)

export { router }
