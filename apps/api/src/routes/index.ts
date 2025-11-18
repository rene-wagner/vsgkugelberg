import { Router } from 'express'
import { postsRouter } from './posts'
import { usersRouter } from './users'

const router = Router()

// Mount routers at their respective base paths
router.use('/users', usersRouter)
router.use('/posts', postsRouter)

export { router }
