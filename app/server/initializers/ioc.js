import Bottle from 'bottlejs';
import path from 'path';
import NodeAcl from 'acl';

import makeRedisClient from './redis';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';

import CallsRequest from '../../lib/requests/dataProviders/Call';

import { IamServiceClientMock, IamServiceClient } from '../../lib/requests/iam/IamServiceClient';
import { createFetchPermissionsMiddleware } from '../../server/middlewares/authorization';
import roleController from '../../server/controllers/role';
import AccountController from '../../server/controllers/account';
import CompanyController from '../../server/controllers/company';
import { ApplicationRequest } from '../../lib/requests/Application';
import MpsClient from '../../lib/requests/mps/MpsClient';
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

  ioc.factory('middlewares.ensureAuthenticated', () =>
    ensureAuthenticated(nconf.get('landing:unauthenticated:path')));

  ioc.factory('middlewares.flash', () => {
    return (require('../middlewares/flash').default)();
  });

  ioc.factory('SmtpTransport', () => {
    const transport = require('../../lib/mailer/transports/smtp').default;
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

  ioc.constant('DATAPROVIDER_API_BASE_URL', nconf.get('dataProviderApi:baseUrl'));
  ioc.constant('DATAPROVIDER_API_TIMEOUT', nconf.get('dataProviderApi:timeout'));
  ioc.service('CallsRequest', CallsRequest, 'DATAPROVIDER_API_BASE_URL', 'DATAPROVIDER_API_TIMEOUT');

  ioc.service(
    'CallStatsRequest',
    require('../../lib/requests/dataProviders/CallStats').default,
    'DATAPROVIDER_API_BASE_URL',
    'DATAPROVIDER_API_TIMEOUT'
  );

  ioc.service('ImRequest', require('../../lib/requests/dataProviders/Im').default, 'DATAPROVIDER_API_BASE_URL', 'DATAPROVIDER_API_TIMEOUT');

  ioc.service(
    'ImStatsRequest',
    require('../../lib/requests/dataProviders/ImStats').default,
    'DATAPROVIDER_API_BASE_URL',
    'DATAPROVIDER_API_TIMEOUT'
  );

  ioc.service(
    'SMSStatsRequest',
    require('../../lib/requests/dataProviders/SMSStats').default,
    'DATAPROVIDER_API_BASE_URL',
    'DATAPROVIDER_API_TIMEOUT'
  );

  ioc.service('VerificationRequest', require('../../lib/requests/dataProviders/Verification').default, 'DATAPROVIDER_API_BASE_URL', 'DATAPROVIDER_API_TIMEOUT');
  ioc.service('UserStatsRequest', require('../../lib/requests/dataProviders/UserStats').default, 'DATAPROVIDER_API_BASE_URL', 'DATAPROVIDER_API_TIMEOUT');
  ioc.service('OverviewStatsRequest', require('../../lib/requests/dataProviders/OverviewStats').default, 'DATAPROVIDER_API_BASE_URL', 'DATAPROVIDER_API_TIMEOUT');
  ioc.service('VsfStatsRequest', require('../../lib/requests/mvs/VsfStatsRequest').default, 'DATAPROVIDER_API_BASE_URL', 'DATAPROVIDER_API_TIMEOUT');

  ioc.constant('MUMS_API_BASE_URL', nconf.get('mumsApi:baseUrl'));
  ioc.constant('MUMS_API_TIMEOUT', nconf.get('mumsApi:timeout'));
  ioc.service('EndUserRequest', require('../../lib/requests/mums/User').default, 'MUMS_API_BASE_URL', 'MUMS_API_TIMEOUT');
  ioc.service('WhitelistRequest', require('../../lib/requests/Whitelist').WhitelistRequest, 'MUMS_API_BASE_URL', 'MUMS_API_TIMEOUT');

  ioc.constant('MVS_API_BASE_URL', nconf.get('mvsApi:baseUrl'));
  ioc.constant('MVS_API_TIMEOUT', nconf.get('mvsApi:timeout'));
  ioc.service('VSFTransactionRequest', require('../../lib/requests/mvs/VSFTransaction').default, 'MVS_API_BASE_URL', 'MVS_API_TIMEOUT');

  ioc.constant('BOSS_API_BASE_URL', nconf.get('bossApi:baseUrl'));
  ioc.constant('BOSS_API_TIMEOUT', nconf.get('bossApi:timeout'));
  ioc.service('TopUpRequest', require('../../lib/requests/boss/TopUp').default, 'BOSS_API_BASE_URL', 'BOSS_API_TIMEOUT');
  ioc.service('WalletRequest', require('../../lib/requests/boss/Wallet').default, 'BOSS_API_BASE_URL', 'BOSS_API_TIMEOUT');

  ioc.service('RedisClient', () => makeRedisClient(nconf.get('redisUri')));

  ioc.factory('ACL', () => new NodeAcl(new NodeAcl.memoryBackend()));

  ioc.factory('ACLManager', container => {
    const AclManager = require('../../main/acl').default;
    const carrierQuerier = require('../../main/acl/carrierQueryService');
    const nodeAcl = container.ACL;

    return new AclManager(nodeAcl, carrierQuerier);
  });

  ioc.constant('IamServiceClientOptions', {
    baseUrl: nconf.get('iamApi:baseUrl'),
  });

  ioc.service('IamServiceClientMock', IamServiceClientMock);
  ioc.service('FetchPermissionsMiddleware', createFetchPermissionsMiddleware, 'IamServiceClientMock');
  ioc.service('IamServiceClient', IamServiceClient, 'IamServiceClientOptions');
  ioc.service('RoleController', roleController, 'IamServiceClient');
  ioc.constant('MpsClientOptions', {
    baseUrl: nconf.get('mpsApi:baseUrl'),
  });

  ioc.service('MpsClient', MpsClient, 'MpsClientOptions');
  ioc.constant('ApplicationOptions', {
    baseUrl: nconf.get('mumsApi:baseUrl'),
    timeout: nconf.get('mumsApi:timeout'),
  });

  ioc.service('ApplicationRequest', ApplicationRequest, 'ApplicationOptions');
  ioc.service('AccountController', AccountController, 'IamServiceClient', 'MpsClient');
  ioc.service('CompanyController', CompanyController, 'IamServiceClient', 'ApplicationRequest', 'MpsClient');

  return ioc;
}
