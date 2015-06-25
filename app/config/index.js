import {baseUrl} from '../utils/url';

/* blindly follow the reference project for now*/
/* should not include sensible information in the configuration*/
module.exports = {
  //TODO check if secure is needed, though not running the server over HTTPS directly
  API_HOST: baseUrl(),
  API_PATH_PREFIX: '/api',
  FILE_UPLOAD_PATH_PREFIX: '/data',
  DISABLE_ISOMORPHISM: Boolean(process.env.DISABLE_ISOMORPHISM) || false,
  COOKIE: {
    MAX_AGE: 1000 * 60 * 30
  },
  PAGES: {
    CALLS: {
      PAGE_SIZE: 100
    }
  }
};

