import Bottle from 'bottlejs';
import logger from 'winston';

import makeRedisClient from './redis';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';

import CallsRequest from '../../lib/requests/dataProviders/Call';
import { IamClient } from '../../lib/requests/iam/IamServiceClient';
import { createFetchPermissionsMiddleware } from '../../server/middlewares/authorization';
import { createAclResolver } from './../../main/acl/acl-resolver';
import roleController from '../../server/controllers/role';
import AccountController from '../../server/controllers/account';
import CompanyController from '../../server/controllers/company';
import ProvisionHelper from '../../server/utils/provisionHelper';
import IamHelper from '../../server/utils/iamHelper';
import provisionController from '../../server/controllers/provision';
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

  ioc.constant('logger', logger);

  ioc.factory('middlewares.ensureAuthenticated', () =>
    ensureAuthenticated(nconf.get('landing:unauthenticated:path')));

  ioc.factory('middlewares.flash', () => {
    return (require('../middlewares/flash').default)();
  });

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

  // Remote service clients (real)
  ioc.constant('MpsClientOptions', {
    baseUrl: nconf.get('mpsApi:baseUrl'),
  });
  ioc.service('MpsClient', MpsClient, 'MpsClientOptions');
  ioc.constant('IamClientOptions', {
    baseUrl: nconf.get('iamApi:baseUrl'),
  });
  ioc.service('IamServiceClient', IamClient, 'IamClientOptions');
  ioc.constant('ApplicationOptions', {
    baseUrl: nconf.get('mumsApi:baseUrl'),
    timeout: nconf.get('mumsApi:timeout'),
  });
  ioc.service('ApplicationRequest', ApplicationRequest, 'ApplicationOptions');

  // Provision Adapter
  ioc.service('ProvisionHelper', ProvisionHelper, 'MpsClient');
  ioc.service('IamHelper', IamHelper, 'IamServiceClient', 'ProvisionHelper');

  // Core components
  ioc.service('AclResolver', createAclResolver, 'logger', 'IamServiceClient', 'ProvisionHelper');

  // Middleware
  ioc.service('FetchPermissionsMiddleware', createFetchPermissionsMiddleware, 'logger', 'AclResolver');

  // Controllers
  ioc.service('RoleController', roleController, 'IamServiceClient');
  ioc.service('CompanyController', CompanyController, 'IamServiceClient');
  ioc.service('AccountController', AccountController, 'IamServiceClient', 'ProvisionHelper');
  ioc.service('ProvisionController', provisionController, 'IamServiceClient', 'ProvisionHelper');

  return ioc;
}
