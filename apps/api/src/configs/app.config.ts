import express, { type Express } from 'express';
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

config();
dotenv.config();

const app: Express = express();

// body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));

app.use(bodyParser.json({ limit: '50mb', inflate: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));

// cookie parser
app.use(cookieParser());

// sanitize data and secure db against sql injection
app.use(expressSanitize());

// secure response header
app.use(helmet());

// prevent parameter pollution
app.use(hpp());

// enable CORS: communicate with multiple domain
app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            // Allow localhost for development
            if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
                return callback(null, true);
            }

            // Allow staging domain
            if (origin.includes('staging.troott.com')) {
                return callback(null, true);
            }

            // Allow production domain
            if (origin.includes('troott.com')) {
                return callback(null, true);
            }

            callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
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

// Routes
app.use('/api/v1', v1Routes);

// Error handler
app.use(errorHandler);

export default app;
