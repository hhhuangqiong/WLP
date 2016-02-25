import { fetchDep } from '../utils/bottle';
import nconf from 'nconf';

import AccountController from '../controllers/account';

const portalUserManager = fetchDep(nconf.get('containerName'), 'PortalUserManager');
const accountController = new AccountController(portalUserManager);

const getAccounts = (req, res, next) => (
  accountController.getAccounts(req, res, next)
);

const createAccount = (req, res, next) => (
  accountController.createAccount(req, res, next)
);

const updateAccount = (req, res, next) => (
  accountController.updateAccount(req, res, next)
);

const deleteAccount = (req, res, next) => (
  accountController.deleteAccount(req, res, next)
);

const verifyToken = (req, res, next) => (
  accountController.verifyToken(req, res, next)
);

const createPassword = (req, res, next) => (
  accountController.createPassword(req, res, next)
);

const changePassword = (req, res, next) => (
  accountController.changePassword(req, res, next)
);

const reverifyAccount = (req, res, next) => (
  accountController.reverifyAccount(req, res, next)
);

export {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  verifyToken,
  createPassword,
  reverifyAccount,
  changePassword,
};
