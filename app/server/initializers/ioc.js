import Bottle from 'bottlejs';
import path from 'path';

import ensureAuthenticated from 'app/server/middlewares/ensureAuthenticated';

import {SignUp} from 'app/lib/portal/SignUp';

/**
 * Initalize the IoC containero
 * The registered factory(s) seems to be lazied loaded.
 *
 * @param {*} nconf nconf instance
 */
export function init(nconf) {
  // intentionally not calling with `new`; otherwise `fetchContainerInstance` cannot work
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

  // seems too verbose to load a template like this:
  ioc.factory('SignUpTemplate', container => {
    var SignUpTemplate = require('app/lib/mailer/emailTemplates/SignUpTemplate');
    return new SignUpTemplate(nconf.get('signUp:email:templateFolderName'), {
      from:    nconf.get('signUp:email:from'),
      subject: nconf.get('signUp:email:subject')
    }, {
      expiryDays: nconf.get('signUp:token:expiry:value')
    });
  });

  ioc.service('SignUp', SignUp, 'Mailer', 'SignUpTemplate');

  ioc.service('Mailer', require('app/lib/mailer/mailer'), 'SmtpTransport');
  ioc.service('TemplateMailer', require('app/lib/mailer/templateMailer'), 'Mailer', 'MAIL_TMPL_CONFIG');

  ioc.service('PortalUserManager', require('app/lib/portal/UserManager'));

  ioc.constant('DATAPROVIDER_API_BASE_URL', nconf.get('dataProviderApi:baseUrl'));
  ioc.constant('DATAPROVIDER_API_TIMEOUT', nconf.get('dataProviderApi:timeout'));
  ioc.service('CallsRequest', require('app/lib/requests/dataProviders/Call'), 'DATAPROVIDER_API_BASE_URL', 'DATAPROVIDER_API_TIMEOUT');
  ioc.service('ImRequest', require('app/lib/requests/dataProviders/Im'), 'DATAPROVIDER_API_BASE_URL', 'DATAPROVIDER_API_TIMEOUT');

  ioc.constant('MUMS_API_BASE_URL', nconf.get('mumsApi:baseUrl'));
  ioc.constant('MUMS_API_TIMEOUT', nconf.get('mumsApi:timeout'));
  ioc.service('EndUserRequest', require('app/lib/requests/mums/User'), 'MUMS_API_BASE_URL', 'MUMS_API_TIMEOUT');
  ioc.service('VSFTransactionRequest', require('app/lib/requests/mums/VSFTransaction'), 'MUMS_API_BASE_URL', 'MUMS_API_TIMEOUT');

  ioc.constant('BOSS_API_BASE_URL', nconf.get('bossApi:baseUrl'));
  ioc.constant('BOSS_API_TIMEOUT', nconf.get('bossApi:timeout'));
  ioc.service('TransactionRequest', require('app/lib/requests/boss/Transaction'), 'BOSS_API_BASE_URL', 'BOSS_API_TIMEOUT');
  ioc.service('WalletRequest', require('app/lib/requests/boss/Wallet'), 'BOSS_API_BASE_URL', 'BOSS_API_TIMEOUT');

  return ioc;
}

/**
 * Retrieve the container with the specified name
 *
 * NB: only able to retrieve those using Bottle as function (instead of Constructor)
 *
 * Usage:
 * ```
 * import { fetchContainerInstance } from 'app/server/initializers/ioc';
 * fetchContainerInstance( nconf.get('containerName') );
 * ```
 *
 * @param {String} name The name of the container instantiated
 * @return {*} container or the dependencies
 */
export function fetchContainerInstance(name) {
  return Bottle.pop(name);
}

/**
 * Retrieve the dependency registered with that container with the specified name
 *
 * @param {String} name The name of the container instantiated
 * @param {String} depIdentifier Dependency identifier
 *
 * @return {*} The registered dependency
 */
export function fetchDep(name, depIdentifer) {
  var ioc = fetchContainerInstance(name);
  if(ioc) {
    //TODO prevent the 'identifier.' case
    return depIdentifer.split('.').reduce( (result, key) => {
      return result[key];
    }, ioc.container);
  }
}