/**
 * Exports the Todos database model.
 * @file
 */

import dynomite from '@passportinc/dynomite';
import constants from '../constants';

const {
  AWS_REGION,
  TODOS_TABLE_NAME,
} = constants;

export default dynomite({
  table: TODOS_TABLE_NAME,
  hashKey: 'id',
  connection: {
    region: AWS_REGION,
  },
  indexes: {
    'name-index': {
      hashKey: 'name',
      rangeKey: 'created_at',
    },
  },
  attributeSchema: {
    id: 'required|uuid',
    name: 'required|string|alpha_dash',
  },
  attributeDefaultValues: {},
});
