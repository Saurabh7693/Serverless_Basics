# My Project

## Contents
1. [Prerequisites](#prerequisites)
1. [Project Structure](#project-structure)
1. [Technologies/Major Libaries](#technologies-major-libraries)
1. [Development](#development)
1. [Architecture](#architecture)
1. [Creating New Lambda Functions](#creating-new-lambda-functions)
1. [Creating Function Routes](#creating-function-routes)
1. [Using Environment Variables](#using-environment-variables)
1. [Testing](#testing)
1. [Error Handling](#error-handling)
1. [CI/CD SETUP](#ci-cd-setup)

> Quick Setup: Search this project for `@TODO` and adjust for your service.

## Project Structure

```js
.
|-- src
|   |-- app                 // Houses all things related to middlewares.
|   |   |-- index.js        // Exports the "App" instance for FaaS abstraction.
|   |
|   |-- database            // This is where our database objects are.
|   |-- functions           // Houses all serverless functions and related code.
|   |-- constants.js        // Exports appliation configuration
```

## Prerequisites
This readme.md assumes that you:
  - Already have node.js v6.0.0+ installed.

## Technologies/Major Libraries
Familiarize yourself with these:

- [node.js](https://nodejs.org/en/)
- [serverless](https://serverless.com/)

**This project uses a homegrown library to emulate an express like interface in a serverless environment.**    
Which means that all the routes you'll be writing will look and feel like you're writing express.

If you're not already familiar with express, check it out [here](https://www.npmjs.com/package/express).

Also, read the documentation at
[@passportinc/serverless-http-stack](https://gitlab.pdev.io/jason.pollman/serverless-http-stack)
once you've read this file. `@passportinc/serverless-http-stack` is the node module that provides
the "express like interface" and a number of other useful http middlewares/utility functions.

## Development

### Starting Serverless Offline
Be sure to start by running `npm install` inside the directory to install dependencies.

Then, the following command:

```bash
npm run start
```

When developing locally, you'll need to make sure your table is created in dynalite as well.
 
## Architecture
Since we're using AWS lambdas for this service, this project has been designed to
launch as quickly as possible and to prevent long [cold starts](https://hackernoon.com/im-afraid-you-re-thinking-about-aws-lambda-cold-starts-all-wrong-7d907f278a4f).
The file structure has been setup so that you can easily import *only what you need* and therefore
keep the number of modules each function `imports` to a minimum.

`things/index.js`
```js
export foo from './foo';
export bar from './bar';
```

This above makes it difficult for webpack to *tree-shake* (remove "dead code"). Instead,
you can and *should* directly import files:

```js
import foo from './things/foo';
```

## Creating New Lambda Functions
To create a new serverless function:

1. **Create a new directory in the `functions` directory**
   In this example, we're using "foo" as the function name.

1. **Create an `index.js` file in that directory with the following contents:**
   `/src/functions/foo/index.js`

   ```js
   import app from '../../app';

   export { app };
   ```

1. **Add the function to your `serverless.yml` file.**

   ```yaml
   functions:
     ... 
     new-function:
       # A reference the `app` export above.
       handler: src/functions/foo/index.app
       # Give the function a name
       name: ${self:service}-foo-v${self:custom.apiVersion}
     ...
   ```

1. **Add some routes to your function**    
   Before you can start interacting with your new function, you need to add some `routes` and
   define some serverless `http events`...

## Creating Function Routes
Once you have a function setup, you'll want to associate one or more http events with it.

To create a new route, assuming your function name is "foo":

1. **Create a new file in the `functions/foo/routes` directory:**    
   The convention is to make the name of the file mimick the route's endpoint.    
   So, if the endpoint is `/hello/world`, name the file `hello-world.js`.
   `/src/functions/foo/routes/helloWorld.js`

   ```js
   // Write your route middleware and export it.
   export default (request, response) => {
     response.send('Hello World!');
   };
   ```

1. **Add a route to the function's index file**    
   `/src/functions/foo/index.js`

   ```js
   import app from '../../app';

   // Import your route middleware
   import helloWorld from './routes/helloWorld';

   // Tell the app to call the `helloWorld` function
   // whenever a GET request is made to /hello/world
   app.get('/hello/world', helloWorld);

   export { app };
   ```

1. **Add an http event to your `serverless.yml` file:**    

   ```yaml
   functions:
     ... 
     foo:
       handler: src/functions/foo/index.app
       name: ${self:service}-foo-v${self:custom.apiVersion}

       # Register an http event...
       events:
        - http:
            path: /hello/world
            method: get
     ...
   ```

1. **You can now make a GET request `localhost:3000/hello/world`**    
   It should respond with "Hello World!"

## Using Environment Variables
**You should not use `process.env` anywhere in this project!**    
Instead, import environment variables from the `constants.js` file.

This file normalizes all environment variables, defaults missing ones, and selects the right
configuration for the current environment.

```js
import {
  EXAMPLE_CONSTANT_A,
  EXAMPLE_CONSTANT_B,
} from './constants';
```

## Testing
We're using the [jest](https://facebook.github.io/jest/) library for unit testing.

**To run unit tests, execute: `npm run test`.**    

Other test commands:
  - `test:cover`
    Runs the unit tests and outputs a code coverage report.
  - `test:watch`
    Runs the unit tests and watches for file changes, re-running the tests when changes occur.

### Test Setup
**Each function within the `functions` directory should contain a `tests` directory.**    
This is where you put your tests.

Also, all tests **must** have the extension `.test.js`, otherwise they won't be detected
by jest and won't run.

### Example Test
Since the "lambda" logic has been abstracted away from the actual routes via the 
[@passportinc/serverless-http-stack](https://gitlab.pdev.io/jason.pollman/serverless-http-stack)
module, unit testing our functions is easy and doesn't require any server to actually be running.

Here's an example test:

`/src/functions/example/tests/hello-world.test.js`
```js
import { expect } from 'chai';

// Import the Request/Response classes so we can pass them to our handler
// This is exactly what app.use('/hello/world', helloWorld) will do later.
import {
  Request,
  Response,
} from '@passportinc/serverless-http-stack/app';

// Import the file that we're testing.
import helloWorld from '../routes/hello';

describe('functions/example/routes/hello', () => {
  it('Should be a function', () => {
    expect(helloWorld).to.be.a('function');
  });

  it('Should response with a 200 status and the body "Hello World!"', () => {
    const request = new Request();
    const response = new Response();

    // Create a new request/response object and invoke the route middleware
    helloWorld(request, response);

    // Check the results
    expect(response.body).to.equal('Hello World!');
    expect(response.statusCode).to.equal(200);
  });
});
```

### Testing Async Functions

Here's a route middleware that's async...

`/src/functions/example/routes/getUser.js`
```js
import { throwNotFoundError } from '@passportinc/serverless-http-stack/errors';

export default async (request, response) => {
  const { query } = request;

  try {
    const user = await someGetUserService(query.id);
    response.json(user);
  } catch (e) {
    throwNotFoundError('User not found');
  }
};
```

And here's an example test for it...

`/src/functions/example/tests/get-user.js`
```js
import { expect } from 'chai';

import {
  Request,
  Response,
} from '@passportinc/serverless-http-stack/app';

import getUser from '../routes/getUser';

describe('/src/functions/example/routes/getUser.js', () => {
  it('Should send back the user object', async () => {
    const response = new Response();

    // Send in a user id to the request object
    const request = new Request({
      query: {
        id: 5,
      },
    });

    await getUser(request, response);

    expect(response.statusCode).to.equal(200);
    expect(response.get('content-type')).to.equal('application/json');
    expect(response.body).to.equal({
      id: 5,
      name: 'Chuck Norris',
    });
  });

  // Hmmm. This file has some "negative" tests,
  // make sure to cover those branches too...
  it('Should send back a 404 error if the user isn\'t found', async () => {
    const response = new Response();

    // Send in a user id to the request object
    const request = new Request({
      query: {
        id: -1,
      },
    });

    await getUser(request, response);

    expect(response.statusCode).to.equal(404);
    expect(response.body).to.equal('Not Found');
  });
});
```

## Error Handling
The "app" framework provided by `@passportinc/serverless-http-stack` provides error handling
just like express by default.

However, you can use the library `@passportinc/serverless-http-stack/errors` to throw
errors with `statusCodes` already set on them to set the response status code.

```js
import { throwUnauthorizedError } from '@passportinc/serverless-http-stack/errors';

export default ((request, response) => {
  throwUnauthorizedError();
});
```

This code will send back the response `Unauthorized` with the HTTP status set to `401`.
For a list of all the available errors, see [@passportinc/serverless-http-stack/errors](https://gitlab.pdev.io/jason.pollman/serverless-http-stack/blob/master/src/errors.js)

## CI/CD Setup
For most projects the `gitlab-ci.yml` that comes in this boilerplate should be sufficient.
However, as always you **should** get DevOps to sign off on any new project infrastructure.

**To get the default CI/CD scripts to work with your service:**
Search `gitlab-ci.yml` and `serverless.yml` for `@TODO` and replace `example` with the name of
your service where applicable.

Once that's done, it should just be a matter of getting DevOps to review everything
and run IAM roles for your new service.