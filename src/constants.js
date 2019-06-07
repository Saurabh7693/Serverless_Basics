/**
 * Application wide constants.
 * This exports a shallow clone of process.env with the supplied defaults
 * that will be used if the process.env equivalent is missing. With that said:
 * you *shouldn't* use process.env anywhere in this application, but import from here!
 * @since 5/28/18
 * @file
 */

import _ from 'lodash';
import fp from 'lodash/fp';
import { tryJsonParse } from '@passportinc/serverless-http-stack/utils';

// Converts things like ENV_VAR=1 from a string to a number
// and ENV_VAR=false to a boolean and not the string 'false'.
const parse = fp.mapValues(tryJsonParse);

// This will apply environment variables in the following order of precendence:
// 1. From the CLI (and as defined in the serverless.yml file).
// 2. From your .env configuration file
// 3. From the default values missing below.
export default Object.assign(exports, parse(_.defaults({}, process.env, {
  NODE_ENV: _.get(process, 'env.NODE_ENV', 'production'),
  AWS_REGION: 'us-east-1',
  TODOS_TABLE_NAME: 'permits-todos',
  IS_OFFLINE: false,
})));
