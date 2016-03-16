import Bottle from 'bottlejs';
import path from 'path';
import NodeAcl from 'acl';

import makeRedisClient from './redis';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';

/**
 * Initialize the IoC container
 * The registered factory(s) seems to be lazied loaded.
 *
 * @param {*} nconf nconf instance
 */
export default function init(nconf) {
  // intentionally not calling with `new`; otherwise `fetchContainerInstance` cannot work
  const ioc = Bottle(nconf.get('containerName'));

  /* eslint-disable max-len */

  // NB: relative to 'node_modules/'
  ioc.constant('MAIL_TMPL_DIR', path.resolve(__dirname, '../../../mail/templates'));
  ioc.constant('MAIL_TMPL_CONFIG', { templatesDir: ioc.container.MAIL_TMPL_DIR });

  ioc.factory('middlewares.ensureAuthenticated', () => {
    return ensureAuthenticated(nconf.get('landing:unauthenticated:path'));
  });

  ioc.factory('middlewares.flash', () => {
    return require('../middlewares/flash')();
  });

  ioc.factory('SmtpTransport', () => {
    const transport = require('../../lib/mailer/transports/smtp');
    return transport(nconf.get('smtp:transport'));
  });

  ioc.service('Mailer', require('../../lib/mailer/mailer'), 'SmtpTransport');
  ioc.service('TemplateMailer', require('../../lib/mailer/templateMailer'), 'Mailer', 'MAIL_TMPL_CONFIG');

  const DEFAULT_MAIL_SERVICE_URL = 'http://deploy.dev.maaii.com:4011';

  // M800 Mail Service
  ioc.constant('M800_MAIL_SERVICE_URL', process.env.M800_MAIL_SERVICE_URL || DEFAULT_MAIL_SERVICE_URL);

  ioc.constant('M800_MAIL_SERVICE_CLIENT_CONFIG', {
    baseUrl: ioc.container.M800_MAIL_SERVICE_URL,
    basePath: '/emails',
  });
  ioc.service('EmailClient', require('m800-mail-service-client'), 'M800_MAIL_SERVICE_CLIENT_CONFIG');

  ioc.service('PortalUserManager', require('../../lib/portal/UserManager'));

  ioc.constant('DATAPROVIDER_API_BASE_URL', nconf.get('dataProviderApi:baseUrl'));
  ioc.constant('DATAPROVIDER_API_TIMEOUT', nconf.get('dataProviderApi:timeout'));
  ioc.service('CallsRequest', require('../../lib/requests/dataProviders/Call'), 'DATAPROVIDER_API_BASE_URL', 'DATAPROVIDER_API_TIMEOUT');

  ioc.service(
    'CallStatsRequest',
    require('../../lib/requests/dataProviders/CallStats'),
    'DATAPROVIDER_API_BASE_URL',
    'DATAPROVIDER_API_TIMEOUT'
  );

  ioc.service('ImRequest', require('../../lib/requests/dataProviders/Im'), 'DATAPROVIDER_API_BASE_URL', 'DATAPROVIDER_API_TIMEOUT');
  ioc.service('VerificationRequest', require('../../lib/requests/dataProviders/Verification'), 'DATAPROVIDER_API_BASE_URL', 'DATAPROVIDER_API_TIMEOUT');
  ioc.service('UserStatsRequest', require('../../lib/requests/dataProviders/UserStats'), 'DATAPROVIDER_API_BASE_URL', 'DATAPROVIDER_API_TIMEOUT');

  ioc.constant('MUMS_API_BASE_URL', nconf.get('mumsApi:baseUrl'));
  ioc.constant('MUMS_API_TIMEOUT', nconf.get('mumsApi:timeout'));
  ioc.service('EndUserRequest', require('../../lib/requests/mums/User'), 'MUMS_API_BASE_URL', 'MUMS_API_TIMEOUT');

  ioc.constant('MVS_API_BASE_URL', nconf.get('mvsApi:baseUrl'));
  ioc.constant('MVS_API_TIMEOUT', nconf.get('mvsApi:timeout'));
  ioc.service('VSFTransactionRequest', require('../../lib/requests/mvs/VSFTransaction'), 'MVS_API_BASE_URL', 'MVS_API_TIMEOUT');

  ioc.constant('BOSS_API_BASE_URL', nconf.get('bossApi:baseUrl'));
  ioc.constant('BOSS_API_TIMEOUT', nconf.get('bossApi:timeout'));
  ioc.service('TopUpRequest', require('../../lib/requests/boss/TopUp'), 'BOSS_API_BASE_URL', 'BOSS_API_TIMEOUT');
  ioc.service('WalletRequest', require('../../lib/requests/boss/Wallet'), 'BOSS_API_BASE_URL', 'BOSS_API_TIMEOUT');

  ioc.service('RedisClient', () => {
    return makeRedisClient(nconf.get('redis'));
  });

  ioc.factory('ACL', () => {
    return new NodeAcl(new NodeAcl.memoryBackend());
  });

  ioc.factory('ACLManager', (container) => {
    const AclManager = require('../../main/acl');
    const carrierQuerier = require('../../main/acl/carrierQueryService');
    const nodeAcl = container.ACL;

    return new AclManager(nodeAcl, carrierQuerier);
  });

  return ioc;
}
