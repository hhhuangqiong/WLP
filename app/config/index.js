/* should not include *sensitive* information here */

module.exports = {
  GLOBAL_DATA_VARIABLE: '__DATA__',
  GLOBAL_CONFIG_VARIABLE: '__CONFIG__',
  GLOBAL_LOCALE_VARIABLE: '__LOCALE__',
  DEFAULT_POST_LOGIN_PATH: '/calls',
  EXPORT_PATH_PREFIX: '/export',
  API_PATH_PREFIX: '/api',
  DISABLE_ISOMORPHISM: Boolean(process.env.DISABLE_ISOMORPHISM) || false,
  LOCALES: ['en', 'zh-hant', 'zh-hans', 'it'],
  COOKIE: {
    // in seconds
    MAX_AGE: 60 * 30,
  },
};
