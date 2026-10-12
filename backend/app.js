import express from 'express';
import { errorHandler, notFound } from './middleware/error.middleware.js';
import { jsonOnly } from './middleware/jsonOnly.middleware.js';
import routes from './routes/index.js';

// The whole API. server.js listens with it locally; on Vercel this default export is the entrypoint.
const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

app.use('/api', jsonOnly, routes, notFound);
app.use(errorHandler);

export default app;
