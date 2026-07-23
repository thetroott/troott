import express, { RequestHandler, type Express } from 'express';
import dotenv, { config } from 'dotenv';
import errorHandler from '../middlewares/error.mdw';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import expressSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import hpp from 'hpp';
import cors from 'cors';
import v1Routes from '../routes/v1/routes.router';
import path from 'path';
import { limitRequests } from '@/middlewares/ratelimit.mdw';
import { speedLimiter } from '@/middlewares/speedlimit.mdw';
import { getOrigins } from '@/utils/origin.util';

config();
dotenv.config();

const app: Express = express();

// body parser
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ limit: '2mb', extended: false }));

app.use(bodyParser.json({ limit: '2mb', inflate: true }));
app.use(bodyParser.urlencoded({ limit: '2mb', extended: false }));

// cookie parser
app.use(cookieParser());

// sanitize data and secure db against sql injection
app.use(expressSanitize());

// secure response header
app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
);

// prevent parameter pollution
app.use(hpp());

// limit requests
app.use(limitRequests);

// limit request speed
app.use(speedLimiter as RequestHandler);

// enable CORS: communicate with multiple domain
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) {
                return callback(null, true);
            }

            if (getOrigins(origin as string)) {
                return callback(null, true);
            }
            // feat-0038: log rejected Origin so Coolify staging CORS misconfig is obvious
            console.error(
                `[cors] Not allowed by CORS origin=${JSON.stringify(origin)}`,
            );
            callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
        exposedHeaders: ['X-New-Token'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: [
            'Origin',
            'X-Requested-With',
            'Content-Type',
            'Accept',
            'Authorization',
            'lg',
            'ch',
        ],
    }),
);

// Set view engine and views
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '../views'));
app.set('trust proxy', 1);

// Routes
app.use('/api/v1', v1Routes);

// Error handler
app.use(errorHandler);

export default app;
