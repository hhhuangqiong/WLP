/* should not include *sensitive* information here */

import {baseUrl} from '../utils/url';
import {isDev} from '../utils/env';

module.exports = {
  DEFAULT_POST_LOGIN_PATH: '/calls',
  API_HOST: baseUrl(process.env.APP_PORT, process.env.APP_HOSTNAME, process.env.APP_IS_SECURE === 'true'),
  API_PATH_PREFIX: '/api',
  EXPORT_PATH_PREFIX: '/export',
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
    DATA_FIELDS: ['call_id', 'caller', 'callee', 'start_time',
    'end_time', 'answer_time', 'duration', 'last_response_code',
    'caller_os_version', 'callee_os_version', 'bye_reason',
    'caller_platform', 'callee_platform', 'caller_hardware_identifier',
    'callee_hardware_identifier', 'caller_country', 'callee_country'],
    EXPORT_FILENAME: 'export.csv'
  }
};
