import express from 'express';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { router } from './routes';
import {
  errorHandlerMiddleware,
  notFoundHandler,
} from './middleware/error-handler.middleware';
import './strategies/local.strategy';
import { createCorsOptions } from './config/cors.config';
import { UPLOAD_DIR } from './config/upload.config';

const app = express();

app.use(cors(createCorsOptions()));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Serve uploaded files statically
app.use('/uploads', express.static(path.resolve(UPLOAD_DIR)));

app.use('/api', router);
app.use(notFoundHandler);
app.use(errorHandlerMiddleware);

export { app };
