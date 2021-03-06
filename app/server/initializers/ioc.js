import Bottle from 'bottlejs';
import logger from 'winston';

import makeRedisClient from './redis';

// Services
import CallsRequest from '../../lib/requests/dataProviders/Call';
import SmsRequest from '../../lib/requests/dataProviders/SMS';
import { IamClient } from '../../lib/requests/iam/IamServiceClient';
import ProvisionHelper from '../../server/utils/provisionHelper';
import MpsClient from '../../lib/requests/mps/MpsClient';
import OcsClient from '../../lib/requests/ocs/OcsClient';
import MaaiiRateClient from '../../lib/requests/maaiiRate/MaaiiRateClient';
import { ApplicationRequest } from '../../lib/requests/Application';

// Infrastructure components (logging, authentication, authorization)
import { createAclResolver } from './../../main/acl/acl-resolver';

// Middleware
import { register as registerMiddleware } from './../middlewares';
// Controllers
import registerControllers from './../controllers';

// Routers
import { createAuthRouter } from './../routers/auth';
import api from './../routers/api';

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
  ioc.service('SmsRequest', SmsRequest, 'DATAPROVIDER_API_BASE_URL', 'DATAPROVIDER_API_TIMEOUT');

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

  ioc.constant('SIGN_UP_RULE_API_BASE_URL', nconf.get('signUpRuleApi:baseUrl'));
  ioc.constant('SIGN_UP_RULE_API_TIMEOUT', nconf.get('signUpRuleApi:timeout'));
  ioc.service('SignupRuleRequest', require('../../lib/requests/signUpRule/SignUpRule').default, 'SIGN_UP_RULE_API_BASE_URL', 'SIGN_UP_RULE_API_TIMEOUT');

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

  // rewrite the company logo path
  const rewriteLogoPath = {
    original: `${nconf.get('iamApi:baseUrl')}/identity/companies/logo`,
    new: `${nconf.get('APP_URL')}/api/companies/logo`,
  };

  ioc.constant('CompanyControllerOptions', {
    proxy: {
      target: nconf.get('iamApi:baseUrl'),
      pathRewrite: {
        '/api/companies/logo': '/identity/companies/logo',
      },
    },
  });
  ioc.constant('MeControllerOptions', { rewriteLogoPath });

  ioc.constant('ApplicationOptions', {
    baseUrl: nconf.get('mumsApi:baseUrl'),
    timeout: nconf.get('mumsApi:timeout'),
  });
  ioc.service('ApplicationRequest', ApplicationRequest, 'ApplicationOptions');
  ioc.constant('OcsClientOptions', {
    baseUrl: nconf.get('ocsApi:baseUrl'),
    timeout: nconf.get('ocsApi:timeout'),
  });
  ioc.constant('MaaiiRateClientOptions', {
    baseUrl: nconf.get('maaiiRateApi:baseUrl'),
    timeout: nconf.get('maaiiRateApi:timeout'),
  });
  ioc.service('OcsClient', OcsClient, 'OcsClientOptions');
  ioc.service('MaaiiRateClient', MaaiiRateClient, 'MaaiiRateClientOptions');

  // Provision Adapter
  ioc.service('ProvisionHelper', ProvisionHelper, 'MpsClient');

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
  ioc.factory('Api', c => {
    const noCacheMiddleware = c.NoCacheMiddleware;
    const authorizationMiddlewareFactory = c.AuthorizationMiddlewareFactory;
    const ensureAuthenticatedMiddleware = c.EnsureAuthenticatedMiddleware;
    const decodeParamsMiddeware = c.DecodeParamsMiddeware;
    const controllers = c.Controllers;
    return api(
      noCacheMiddleware,
      authorizationMiddlewareFactory,
      ensureAuthenticatedMiddleware,
      decodeParamsMiddeware,
      controllers,
    );
  });

  return ioc;
}
