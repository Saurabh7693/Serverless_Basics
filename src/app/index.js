/**
 * Exports the serverless App instance that this application will use.
 * This is used throughout the application by the various routes so that in the event of
 * any service provider change, this can be applied everywhere by editing only this file.
 * Add "global" middlewares that apply to every function here.
 * @since 5/28/18
 * @file
 */

import serverlessApp from '@passportinc/serverless-http-stack/app';
import { passportStandard } from '@passportinc/serverless-http-stack/middlewares';

const app = serverlessApp('aws');

// Sets the middlewares that *every* route will use.
// You should use "global" middlewares sparingly and on an
// app by app basis since these will apply to all functions!
app.use(passportStandard());

export default app;
