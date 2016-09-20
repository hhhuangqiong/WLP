import accountController from './account';
import authController from './auth';
import carrierController from './carrier';
import companyController from './company';
import provisionController from './provision';
import exportController from './export';
import roleController from './role';
import carrierWalletController from './carrierWallet';

function register(container) {
  container.service('AuthController', authController);
  container.service('RoleController', roleController, 'IamServiceClient');
  container.service('CompanyController', companyController, 'IamServiceClient');
  container.service('AccountController', accountController, 'IamServiceClient', 'ProvisionHelper');
  container.service('ProvisionController', provisionController, 'IamServiceClient', 'ProvisionHelper');
  container.service('ExportController', exportController);
  container.service('CarrierController', carrierController);
  container.service('CarrierWalletController', carrierWalletController, 'McmClient');
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

  register,
};

export default register;
