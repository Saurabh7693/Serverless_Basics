/**
 * Exports custom routes related to todos.
 * @since 3/1/19
 * @file
 */

import _ from 'lodash';
import logger from '@passportinc/funyan';
import { withMultiValidation } from '@passportinc/serverless-http-stack/middlewares';
import Todos from '../../../database/Todos';

const log = logger.child('routes:todos');

/**
 * An example route that finds todos by name using the table's `name-index`.
 * @param {Request} request The HTTP Request object.
 * @param {Response} response The HTTP Response object.
 * @returns {undefined}
 * @export
 */
export async function getTodosByNameHandler(request, response) {
  const { name } = request.params;
  const limit = _.clamp(_.toInteger(request.query.limit || 1000), 1, 1000);

  const results = await Todos
    .find({ name }, 'name-index')
    .limit(limit)
    .exec();

  log.debug('Found the following todos for user %s:', name, results);
  response.json(results);
}

// Wraps the `getTodosByNameHandler` checking for the following validations.
// This will check for a required URL parameter `name` that is a string and
// an optional query parameter `limit` that must be a number. Also available
// here is `body` to validate against request body fields.
// Do your checks here (to keep your handlers squeaky clean).
export const getTodosByName = withMultiValidation(getTodosByNameHandler, {
  params: {
    name: 'required|string',
  },
  query: {
    limit: 'integer',
  },
});
