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
    DATA_FIELDS: [
      'call_id', 'caller', 'callee', 'type', 'start_time',
      'end_time', 'answer_time', 'duration', 'last_response_code',
      'caller_os_version', 'callee_os_version', 'bye_reason',
      'caller_platform', 'callee_platform', 'caller_hardware_identifier',
      'callee_hardware_identifier', 'caller_country', 'callee_country'
    ],
    EXPORT_FILENAME: 'export_calls.csv'
  },
  IM_EXPORT: {
    DATA_FIELDS: [
      'type', 'message_type', 'message_size', 'sender',
      'origin', 'recipient', 'recipients', 'destination', 'platform',
      'stanza_type', 'resource_id', 'theme', 'resource', 'region',
      'file_size', 'thread', 'stanza_id', 'timestamp', 'device_id',
      'receive_id'
    ],
    EXPORT_FILENAME: 'export_im.csv'
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
