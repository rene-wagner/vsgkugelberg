import { Router } from 'express'
import { authRouter } from './auth.routes'
import { usersRouter } from './users.routes'
import { postsRouter } from './posts.routes'
import { categoriesRouter } from './categories.routes'
import { tagsRouter } from './tags.routes'
import { departmentsRouter } from './departments.routes'
import { healthRouter } from './health.routes'

const router = Router()

router.use('/auth', authRouter)
router.use('/users', usersRouter)
router.use('/posts', postsRouter)
router.use('/categories', categoriesRouter)
router.use('/tags', tagsRouter)
router.use('/departments', departmentsRouter)
router.use('/health', healthRouter)

export { router }
