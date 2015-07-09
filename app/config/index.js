/* should not include *sensitive* information here */

import {baseUrl} from '../utils/url';

module.exports = {
  DEFAULT_POST_LOGIN_PATH: '/calls',
  API_HOST: baseUrl(process.env.APP_PORT, process.env.APP_HOSTNAME, process.env.APP_IS_SECURE === 'true'),
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
  }
};

