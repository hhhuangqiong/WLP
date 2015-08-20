import { Router } from 'express';
import { fetchDep } from '../utils/bottle';
import nconf from 'nconf';

import AccountController from '../controllers/account';

let portalUserManager = fetchDep(nconf.get('containerName'), 'PortalUserManager');
let accountController = new AccountController(portalUserManager);

let getAccounts = (req, res, next) => {
  return accountController.getAccounts(req, res, next);
};

let createAccount = (req, res, next) => {
  return accountController.createAccount(req, res, next);
};

let updateAccount = (req, res, next) => {
  return accountController.updateAccount(req, res, next);
};

let deleteAccount = (req, res, next) => {
  return accountController.deleteAccount(req, res, next);
};

let verifyToken = (req, res, next) => {
  return accountController.verifyToken(req, res, next);
};

let createPassword = (req, res, next) => {
  return accountController.createPassword(req, res, next);
};

let changePassword = (req, res, next) => {
  return accountController.changePassword(req, res, next);
};

let reverifyAccount = (req, res, next) => {
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
  changePassword
};
