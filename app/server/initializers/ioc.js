import Bottle from 'bottlejs';
import path from 'path';

import ensureAuthenticated from 'app/server/middlewares/ensureAuthenticated';

/**
 * Initalize the IoC containero
 * The registered factory(s) seems to be lazied loaded.
 *
 * @param {*} nconf nconf instance
 */
export function init(nconf) {
  // intentionally not calling with `new`; otherwise `fetchContainer` cannot work
  var ioc = Bottle(nconf.get('containerName'));

  // NB: relative to 'node_modules/'
  ioc.constant('MAIL_TMPL_DIR', path.resolve(__dirname, '../../../../mail/templates'));
  ioc.constant('MAIL_TMPL_CONFIG', { templatesDir: ioc.container.MAIL_TMPL_DIR });

  ioc.factory('middlewares.ensureAuthenticated', (container) => {
    return ensureAuthenticated(nconf.get('landing:unauthenticated:path'));
  });

  ioc.factory('middlewares.flash', (container) => {
    return require('app/server/middlewares/flash')();
  });

  ioc.factory('SmtpTransport', container => {
    var transport = require('app/lib/mailer/transports/smtp');
    return transport(nconf.get('smtp:transport'));
  });

  ioc.service('Mailer', require('app/lib/mailer/mailer'), 'SmtpTransport');
  ioc.service('TemplateMailer', require('app/lib/mailer/templateMailer'), 'Mailer', 'MAIL_TMPL_CONFIG');

  ioc.service('PortalUserManager', require('app/lib/portal/UserManager'));

  ioc.constant('MUMS_API_BASE_URL', nconf.get('mumsApi:baseUrl'));
  ioc.constant('MUMS_API_TIMEOUT', nconf.get('mumsApi:timeout'));
  ioc.service('EndUsersRequest', require('app/lib/requests/Users'), 'MUMS_API_BASE_URL', 'MUMS_API_TIMEOUT');

  return ioc;
}

/**
 * Retrieve the container with the specified name, or
 * the dependency registered with that container
 *
 * Implement to avoid passing container around
 * NB: only able to retrieve those using Bottle as function (instead of Constructor)
 *
 * Usage:
 * ```
 * import { fetchContainer } from 'app/server/initializers/ioc';
 * fetchContainer( nconf.get('containerName') );
 * ```
 *
 * @param {String} name The name of the container instantiated
 * @param {String} [depIdentifier] Dependency identifier
 *
 * @return {*} container or the dependencies
 */
export function fetchContainer(name, depIdentifer) {
  var bottle = Bottle.pop(name);
  if(!depIdentifer) {
    return bottle.container;
  } else {
    //TODO prevent the 'identifier.' case
    return depIdentifer.split('.').reduce( (result, key) => {
      return result[key];
    }, bottle.container);
  }
}
