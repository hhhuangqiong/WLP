/* should not include *sensitive* information here */

import {baseUrl} from '../utils/url';

module.exports = {
  DEFAULT_POST_LOGIN_PATH: '/calls',
  EXPORT_PATH_PREFIX: '/export',
  API_PATH_PREFIX: '/api',
  FILE_UPLOAD_PATH_PREFIX: '/data',
  DISABLE_ISOMORPHISM: Boolean(process.env.DISABLE_ISOMORPHISM) || false,
  COOKIE: {
    // in seconds
    MAX_AGE: 60 * 30
  },
  PAGES: {
    CALLS: {
      PAGE_SIZE: 100
    },
    IMS: {
      PAGE_SIZE: 100
    }
  },
  CDR_EXPORT: {
    ATTEMPTS: 5,
    DATA_FIELDS: ['call_id', 'caller', 'callee', 'type', 'start_time',
    'end_time', 'answer_time', 'duration', 'last_response_code',
    'caller_os_version', 'callee_os_version', 'bye_reason',
    'caller_platform', 'callee_platform', 'caller_hardware_identifier',
    'callee_hardware_identifier', 'caller_country', 'callee_country'],
    EXPORT_FILENAME: 'export.csv'
  },
  WIDGETS: {
    OVERVIEW: {
      NUMBER_OF_WIDGETS: 6
    },
    CALLS: {
      NUMBER_OF_WIDGETS: 10
    },
    IM: {
      NUMBER_OF_WIDGETS: 8
    },
    SMS: {
      NUMBER_OF_WIDGETS: 3
    },
    STORES: {
      NUMBER_OF_WIDGETS: 3
    },
    VSF: {
      NUMBER_OF_WIDGETS: 3
    }
  }
};
