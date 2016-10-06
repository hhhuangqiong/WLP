import Bottle from 'bottlejs';
import logger from 'winston';

import makeRedisClient from './redis';

// Services
import CallsRequest from '../../lib/requests/dataProviders/Call';
import { IamClient } from '../../lib/requests/iam/IamServiceClient';
import ProvisionHelper from '../../server/utils/provisionHelper';
import IamHelper from '../../server/utils/iamHelper';
import MpsClient from '../../lib/requests/mps/MpsClient';
import OcsClient from '../../lib/requests/ocs/OcsClient';
import { ApplicationRequest } from '../../lib/requests/Application';

// Infrastructure components (logging, authentication, authorization)
import { createAclResolver } from './../../main/acl/acl-resolver';

// Middleware
import { register as registerMiddleware } from './../middlewares';
// Controllers
import { register as registerControllers } from './../controllers';

// Routers
import { createAuthRouter } from './../routers/auth';

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
  ioc.service('SignupRuleRequest', require('../../lib/requests/mums/SignupRule').default, 'MUMS_API_BASE_URL', 'MUMS_API_TIMEOUT');

  ioc.constant('MVS_API_BASE_URL', nconf.get('mvsApi:baseUrl'));
  ioc.constant('MVS_API_TIMEOUT', nconf.get('mvsApi:timeout'));
  ioc.service('VSFTransactionRequest', require('../../lib/requests/mvs/VSFTransaction').default, 'MVS_API_BASE_URL', 'MVS_API_TIMEOUT');

  ioc.constant('BOSS_API_BASE_URL', nconf.get('bossApi:baseUrl'));
  ioc.constant('BOSS_API_TIMEOUT', nconf.get('bossApi:timeout'));
  ioc.service('TopUpRequest', require('../../lib/requests/boss/TopUp').default, 'BOSS_API_BASE_URL', 'BOSS_API_TIMEOUT');
  ioc.service('WalletRequest', require('../../lib/requests/boss/Wallet').default, 'BOSS_API_BASE_URL', 'BOSS_API_TIMEOUT');

  ioc.service('RedisClient', () => makeRedisClient(nconf.get('redisUri')));

  // Remote service clients
  ioc.constant('MpsClientOptions', {
    baseUrl: nconf.get('mpsApi:baseUrl'),
    timeout: nconf.get('mpsApi:timeout'),
  });
  ioc.service('MpsClient', MpsClient, 'MpsClientOptions');
  ioc.constant('IamClientOptions', {
    baseUrl: nconf.get('iamApi:baseUrl'),
    timeout: nconf.get('iamApi:timeout'),
  });
  ioc.service('IamServiceClient', IamClient, 'IamClientOptions');
  ioc.constant('ApplicationOptions', {
    baseUrl: nconf.get('mumsApi:baseUrl'),
    timeout: nconf.get('mumsApi:timeout'),
  });
  ioc.service('ApplicationRequest', ApplicationRequest, 'ApplicationOptions');
  ioc.constant('OcsClientOptions', {
    baseUrl: nconf.get('ocsApi:baseUrl'),
    timeout: nconf.get('ocsApi:timeout'),
  });
  ioc.service('OcsClient', OcsClient, 'OcsClientOptions');

  // Provision Adapter
  ioc.service('ProvisionHelper', ProvisionHelper, 'MpsClient');
  ioc.service('IamHelper', IamHelper, 'IamServiceClient', 'ProvisionHelper');

  // Core components
  ioc.service('AclResolver', createAclResolver, 'logger', 'IamServiceClient', 'ProvisionHelper');

  // Middleware
  ioc.constant('SessionMiddlewareOptions', {
    redisUri: nconf.get('redisUri'),
    retryAttempts: nconf.get('redisFailoverAttempts'),
    secret: nconf.get('secret:session'),
  });
  registerMiddleware(ioc);

  // Controllers
  registerControllers(ioc);

  // Routers
  ioc.service('AuthRouter', createAuthRouter, 'AuthController');

  return ioc;
}
