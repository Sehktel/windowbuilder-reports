'use strict';

import Koa from 'koa';
const app = new Koa();

// Register the cors as Koa middleware
import cors from '@koa/cors';
app.use(cors({credentials: true, maxAge: 600}));

// Register the router as Koa middleware
import rep from './router';
app.use(rep.middleware());

app.listen(process.env.PORT || 3030);
app.restrict_ips = process.env.IPS ? process.env.IPS.split(',') : [];

export default app;
