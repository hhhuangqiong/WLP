import accountController from './account';
import authController from './auth';
import carrierController from './carrier';
import companyController from './company';
import provisionController from './provision';
import exportController from './export';
import roleController from './role';
import carrierWalletController from './carrierWallet';
import resourceController from './resource';
import meController from './me';
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
  container.service('CarrierController', carrierController);
  container.service('ResourceController', resourceController, 'AclResolver');
  container.service('CarrierWalletController', carrierWalletController, 'OcsClient');
  container.service('CarrierRateController', carrierRateController, 'MaaiiRateClient');
}

export {
  accountController,
  authController,
  carrierController,
  companyController,
  provisionController,
  exportController,
  roleController,
  carrierWalletController,
  meController,
  resourceController,
  carrierRateController,
  register,
};

export default register;
