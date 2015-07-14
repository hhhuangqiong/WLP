import Bottle from 'bottlejs';
import path from 'path';
import _ from 'lodash';

import makeRedisClient from './redis';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';
import {SignUp} from '../../lib/portal/SignUp';

/**
 * Initalize the IoC containero
 * The registered factory(s) seems to be lazied loaded.
 *
 * @param {*} nconf nconf instance
 */
export default function init(nconf) {
  // intentionally not calling with `new`; otherwise `fetchContainerInstance` cannot work
  var ioc = Bottle(nconf.get('containerName'));

  // NB: relative to 'node_modules/'
  ioc.constant('MAIL_TMPL_DIR', path.resolve(__dirname, '../../../mail/templates'));
  ioc.constant('MAIL_TMPL_CONFIG', { templatesDir: ioc.container.MAIL_TMPL_DIR });

  ioc.factory('middlewares.ensureAuthenticated', (container) => {
    return ensureAuthenticated(nconf.get('landing:unauthenticated:path'));
  });

  ioc.factory('middlewares.flash', (container) => {
    return require('../middlewares/flash')();
  });

  ioc.factory('SmtpTransport', container => {
    var transport = require('../../lib/mailer/transports/smtp');
    return transport(nconf.get('smtp:transport'));
  });

  // seems too verbose to load a template like this:
  ioc.factory('SignUpTemplate', container => {
    var SignUpTemplate = require('../../lib/mailer/emailTemplates/SignUpTemplate');
    return new SignUpTemplate(nconf.get('signUp:email:templateFolderName'), {
      from:    nconf.get('signUp:email:from'),
      subject: nconf.get('signUp:email:subject')
    }, {
      expiryDays: nconf.get('signUp:token:expiry:value')
    });
  });

  ioc.service('SignUp', SignUp, 'Mailer', 'SignUpTemplate');

  ioc.service('Mailer', require('../../lib/mailer/mailer'), 'SmtpTransport');
  ioc.service('TemplateMailer', require('../../lib/mailer/templateMailer'), 'Mailer', 'MAIL_TMPL_CONFIG');

  ioc.service('PortalUserManager', require('../../lib/portal/UserManager'));

  ioc.constant('DATAPROVIDER_API_BASE_URL', nconf.get('dataProviderApi:baseUrl'));
  ioc.constant('DATAPROVIDER_API_TIMEOUT', nconf.get('dataProviderApi:timeout'));
  ioc.service('CallsRequest', require('../../lib/requests/dataProviders/Call'), 'DATAPROVIDER_API_BASE_URL', 'DATAPROVIDER_API_TIMEOUT');
  ioc.service('ImRequest', require('../../lib/requests/dataProviders/Im'), 'DATAPROVIDER_API_BASE_URL', 'DATAPROVIDER_API_TIMEOUT');

  ioc.constant('MUMS_API_BASE_URL', nconf.get('mumsApi:baseUrl'));
  ioc.constant('MUMS_API_TIMEOUT', nconf.get('mumsApi:timeout'));
  ioc.service('EndUserRequest', require('../../lib/requests/mums/User'), 'MUMS_API_BASE_URL', 'MUMS_API_TIMEOUT');

  ioc.constant('VSF_API_BASE_URL', nconf.get('vsfApi:baseUrl'));
  ioc.constant('VSF_API_TIMEOUT', nconf.get('vsfApi:timeout'));
  ioc.service('VSFTransactionRequest', require('../../lib/requests/mums/VSFTransaction'), 'VSF_API_BASE_URL', 'VSF_API_TIMEOUT');

  ioc.constant('BOSS_API_BASE_URL', nconf.get('bossApi:baseUrl'));
  ioc.constant('BOSS_API_TIMEOUT', nconf.get('bossApi:timeout'));
  ioc.service('TopUpRequest', require('../../lib/requests/boss/TopUp'), 'BOSS_API_BASE_URL', 'BOSS_API_TIMEOUT');
  ioc.service('WalletRequest', require('../../lib/requests/boss/Wallet'), 'BOSS_API_BASE_URL', 'BOSS_API_TIMEOUT');

  ioc.service('RedisClient', (container) => {
    return makeRedisClient(nconf.get('redis'));
  });

  return ioc;
}
