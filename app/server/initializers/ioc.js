import Bottle from 'bottlejs';
import path from 'path';

/**
 * Initalize the IoC container
 *
 * @param {*} nconf nconf instance
 */
export function init(nconf) {
  // intentionally not calling with `new`
  var ioc = Bottle(nconf.get('containerName'));

  // NB: relative to 'node_modules/'
  ioc.constant('MAIL_TMPL_DIR', path.resolve(__dirname, '../../../../mail/templates'));
  ioc.constant('MAIL_TMPL_CONFIG', { templatesDir: ioc.container.MAIL_TMPL_DIR });

  ioc.factory('SmtpTransport', container => {
    var transport = require('app/lib/mailer/transports/smtp');
    return transport(nconf.get('smtp:transport'));
  });

  ioc.service('Mailer', require('app/lib/mailer/mailer'), 'SmtpTransport');
  ioc.service('TemplateMailer', require('app/lib/mailer/templateMailer'), 'Mailer', 'MAIL_TMPL_CONFIG');

  ioc.service('PortalUserManager', require('app/lib/portal/UserManager'));

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
  if(!depIdentifer)
    return bottle;
  else
    return bottle.container[depIdentifer];
}
