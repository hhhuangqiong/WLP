/** @module initializers/nconf */

import logger from 'winston';
import nconf from 'nconf';
import path from 'path';

const ENV_CONFIG_FILE_PREFIX = 'env-';

/**
 * Initialize the nconf settings
 *
 * @param {string} env development, test, or production
 * @param {string} configDir Where configuration file(s) are kept
 * @param {Object} opts
 * @param {string} [opts.envConfigFilePrefix=env-]
 * @param {string} [opts.envSeparator=__]
 * @return {Object} nconf
 */
export default function initialize(env, configDir, opts = { envSeparator: '__' }) {
  nconf.argv();
  nconf.env(opts.envSeparator);

  // TODO
  // - dynamically include files; assume some files (other than 'env-*') are not supposed to be included
  const files = ['global.json', 'client.json'];

  files.push(envConfigName(env, opts.envConfigFilePrefix || ENV_CONFIG_FILE_PREFIX));

  files.forEach(function (f) {
    nconf.file(f, {
      file: f,
      dir: configDir,
      search: true,
    });
  });
  logger.debug('loading configuration files %j under "%s"', files, configDir);

  // TODO verify the existence of default config
  const defaults = require(path.join(configDir, 'defaults.json'));
  nconf.defaults(defaults);

  return nconf;
}

/**
 * Generate the config file name
 *
 * @param {string} env
 * @param {string} filePrefix
 * @return {string}
 */
function envConfigName(env, filePrefix) {
  return `${filePrefix}${env}.json`;
}
