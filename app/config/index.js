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
    },
    VERIFICATIONS: {
      PAGE_SIZE: 10
    }
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
