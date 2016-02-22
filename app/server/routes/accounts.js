import { fetchDep } from '../utils/bottle';
import nconf from 'nconf';

import AccountController from '../controllers/account';

const portalUserManager = fetchDep(nconf.get('containerName'), 'PortalUserManager');
const accountController = new AccountController(portalUserManager);

const getAccounts = (req, res, next) => {
  return accountController.getAccounts(req, res, next);
};

const createAccount = (req, res, next) => {
  return accountController.createAccount(req, res, next);
};

const updateAccount = (req, res, next) => {
  return accountController.updateAccount(req, res, next);
};

const deleteAccount = (req, res, next) => {
  return accountController.deleteAccount(req, res, next);
};

const verifyToken = (req, res, next) => {
  return accountController.verifyToken(req, res, next);
};

const createPassword = (req, res, next) => {
  return accountController.createPassword(req, res, next);
};

const changePassword = (req, res, next) => {
  return accountController.changePassword(req, res, next);
};

const reverifyAccount = (req, res, next) => {
  return accountController.reverifyAccount(req, res, next);
};

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
