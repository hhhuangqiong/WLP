import accountController from './account';
import authController from './auth';
import companyController from './company';
import provisionController from './provision';
import exportController from './export';
import roleController from './role';
import carrierWalletController from './carrierWallet';
import resourceController from './resource';
import meController from './me';
import userController from './user';
import callController from './call';
import imController from './im';
import overviewController from './overview';
import signUpController from './signUp';
import topUpController from './topUp';
import smsController from './sms';
import vsfController from './vsf';
import verificationController from './verifications';
import applicationController from './application';
import carrierRateController from './carrierRate';

function register(container) {
  container.service('AuthController', authController);
  container.service('MeController', meController,
    'AclResolver', 'IamServiceClient', 'ProvisionHelper', 'MeControllerOptions');
  container.service('RoleController', roleController, 'IamServiceClient', 'ProvisionHelper');
  container.service('CompanyController', companyController,
    'IamServiceClient', 'ProvisionHelper', 'CompanyControllerOptions');
  container.service('AccountController', accountController, 'IamServiceClient', 'ProvisionHelper');
  container.service('ProvisionController', provisionController,
    'IamServiceClient', 'ProvisionHelper');
  container.service('ExportController', exportController);
  container.service('UserController', userController,
    'EndUserRequest',
    'WalletRequest',
    'UserStatsRequest',
  );
  container.service('CallController', callController,
    'CallsRequest',
    'CallStatsRequest',
    'RedisClient'
  );
  container.service('SignUpController', signUpController, 'SignupRuleRequest');
  container.service('TopUpController', topUpController, 'TopUpRequest');
  container.service('SmsController', smsController, 'SmsRequest', 'SMSStatsRequest');
  container.service('VsfController', vsfController, 'VSFTransactionRequest', 'VsfStatsRequest');
  container.service('VerificationController', verificationController, 'VerificationRequest');
  container.service('ApplicationController', applicationController, 'ApplicationRequest');
  container.service('OverviewController', overviewController, 'OverviewStatsRequest');
  container.service('ImController', imController, 'ImRequest', 'ImStatsRequest');
  container.service('ResourceController', resourceController, 'AclResolver');
  container.service('CarrierWalletController', carrierWalletController, 'OcsClient');
  container.service('CarrierRateController', carrierRateController, 'MaaiiRateClient');
  container.factory('Controllers', c => ({
    accountController: c.AccountController,
    authController: c.AuthController,
    carrierController: c.CarrierController,
    carrierRateController: c.CarrierRateController,
    carrierWalletController: c.CarrierWalletController,
    companyController: c.CompanyController,
    exportController: c.ExportController,
    meController: c.MeController,
    provisionController: c.ProvisionController,
    resourceController: c.ResourceController,
    roleController: c.RoleController,
    userController: c.UserController,
    callController: c.CallController,
    imController: c.ImController,
    overviewController: c.OverviewController,
    signUpController: c.SignUpController,
    topUpController: c.TopUpController,
    smsController: c.SmsController,
    vsfController: c.VsfController,
    verificationController: c.VerificationController,
    applicationController: c.ApplicationController,
  }));
}

export default register;
