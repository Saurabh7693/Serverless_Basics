/**
 * The API for the Code Challenge Service.
 * @since 7/24/18
 * @file
 */

import app from '../../app';

import * as routes from './routes';
import { createCodeChallenge } from './routes/code-challenges';

// A custom route to get todos by name.
app.post('/code-challenges', createCodeChallenge);

app.get('/code-challenges', (req, res) => {
  res.status(200).json(true);
});

export { app };
