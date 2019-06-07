/**
 * Tests for /src/functions/api/routes/todos.js
 * @since 3/1/19
 * @file
 */

import {
  Request,
  Response,
} from '@passportinc/serverless-http-stack/app';

import _ from 'lodash';
import sinon from 'sinon';
import Todos from '../../../../database/Todos';

import { getTodosByNameHandler } from '../todos';

/**
 * Creates a Todos database mock object.
 * @returns {Object} A mock object for use with sinon.
 */
function createTodosMock({
  todos,
  index,
  limit,
  params,
}) {
  const Mock = {
    find: (parameters, indexName) => {
      expect(indexName).toBe(index);
      expect(parameters).toEqual(params);
      return Mock;
    },
    limit: (value) => {
      expect(value).toBe(limit);
      return Mock;
    },
    exec: () => Promise.resolve(todos),
  };

  return Mock;
}

describe('/src/functions/api/routes/todos', () => {
  const stubs = {};

  // Clear all function stubs after each test.
  // This makes sure we don't have stubbed functions in one test that we didn't want stubbed
  // in another. Also, trying to "re-stub" a stubbed function will throw an error.
  afterEach(() => _.each(stubs, stub => stub.restore()));

  describe('getTodosByName', () => {
    it('Should get todos by name (limit query parameter supplied)', async () => {
      const todos = [
        { todo: true },
        { todo: true },
      ];

      const TodosMock = createTodosMock({
        todos,
        limit: 10,
        index: 'name-index',
        params: { name: 'foobar' },
      });

      stubs.findStub = sinon.stub(Todos, 'find').callsFake(TodosMock.find);
      const request = new Request({
        query: {
          limit: 10,
        },
        params: {
          name: 'foobar',
        },
      });

      const response = new Response();
      await getTodosByNameHandler(request, response);

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toBe('application/json');
      expect(response.body).toBe(JSON.stringify(todos));
    });

    it('Should get todos by name (limit query parameter not supplied)', async () => {
      const todos = [
        { todo: true },
        { todo: true },
      ];

      const TodosMock = createTodosMock({
        todos,
        limit: 1000, // Default value in code.
        index: 'name-index',
        params: { name: 'bazbar' },
      });

      stubs.findStub = sinon.stub(Todos, 'find').callsFake(TodosMock.find);
      const request = new Request({
        params: {
          name: 'bazbar',
        },
      });

      const response = new Response();
      await getTodosByNameHandler(request, response);

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toBe('application/json');
      expect(response.body).toBe(JSON.stringify(todos));
    });
  });
});
