import { fetchDep } from '../utils/bottle';
import nconf from 'nconf';

const accountController = fetchDep(nconf.get('containerName'), 'AccountController');

const getAccounts = (req, res, next) => (
  accountController.getAccounts(req, res, next)
);

const getAccount = (req, res, next) => (
  accountController.getAccount(req, res, next)
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

export {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
};
