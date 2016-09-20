import { Router } from 'express';
import nconf from 'nconf';

import cacheControl from '../middlewares/cacheControl';
import {
  createAuthorizationMiddleware as authorize,
} from '../middlewares/authorization';
import { permission, RESOURCE, ACTION } from './../../main/acl/acl-enums';
import { fetchDep } from './../utils/bottle';

// Merge params is used to inherit carrierId from common parent router
const routes = new Router({ mergeParams: true });
const apiRouter = new Router();
apiRouter
  .use('/carriers/:carrierId', routes)
  .use('*', (req, res) => res.status(400).json({
    error: {
      name: 'Unknown URL',
      message: `No endpoint for the given URL ${req.originalUrl}`,
    },
  }));

// TODO: refactor api.js to be a factory function with dependencies
const roleController = fetchDep(nconf.get('containerName'), 'RoleController');
const companies = fetchDep(nconf.get('containerName'), 'CompanyController');
const accounts = fetchDep(nconf.get('containerName'), 'AccountController');
const provision = fetchDep(nconf.get('containerName'), 'ProvisionController');
const carriers = fetchDep(nconf.get('containerName'), 'CarrierController');
const carrierWalletController = fetchDep(nconf.get('containerName'), 'CarrierWalletController');

// eslint:max-len 0
routes
  .use(cacheControl)
  .get('/company',
    carriers.getCompany,
  )
  .get('/overview/summaryStats', [
    authorize(permission(RESOURCE.GENERAL)),
    carriers.getOverviewSummaryStats,
  ])
  .get('/overview/detailStats', [
    authorize(permission(RESOURCE.GENERAL)),
    carriers.getOverviewDetailStats,
  ])
  // end users
  .get('/users', [
    authorize(permission(RESOURCE.END_USER)),
    carriers.getUsers,
  ])
  .get('/carriers/:carrierId/users/whitelist/:username?', [
    authorize(permission(RESOURCE.WHITELIST)),
    carriers.getWhitelist,
  ])
  .post('/carriers/:carrierId/users/whitelist', [
    authorize(permission(RESOURCE.WHITELIST, ACTION.CREATE)),
    carriers.addWhitelist,
  ])
  .delete('/carriers:/:carrierId/users/whitelist', [
    authorize(permission(RESOURCE.WHITELIST, ACTION.DELETE)),
    carriers.removeWhitelist,
  ])
  // TODO: change userStatsTotal and userStatsMonthly
  .get('/userStatsTotal', [
    authorize(permission(RESOURCE.END_USER)),
    carriers.getEndUsersStatsTotal,
  ])
  .get('/userStatsMonthly', [
    authorize(permission(RESOURCE.END_USER)),
    carriers.getEndUsersStatsMonthly,
  ])
  .get('/stat/user/query', [
    authorize(permission(RESOURCE.END_USER)),
    carriers.getEndUsersStats,
  ])
  .get('/users/:username', [
    authorize(permission(RESOURCE.END_USER)),
    carriers.getUsername,
  ])
  .get('/users/:username/wallet', [
    authorize(permission(RESOURCE.END_USER)),
    carriers.getUserWallet,
  ])
  .post('/users/:username/suspension', [
    authorize(permission(RESOURCE.END_USER, ACTION.UPDATE)),
    carriers.suspendUser,
  ])
  .delete('/users/:username/suspension', [
    authorize(permission(RESOURCE.END_USER, ACTION.UPDATE)),
    carriers.reactivateUser,
  ])
  // calls
  .get('/calls', [
    authorize(permission(RESOURCE.CALL)),
    carriers.getCalls,
  ])
  .get('/callUserStatsMonthly', [
    authorize(permission(RESOURCE.CALL)),
    carriers.getCallUserStatsMonthly,
  ])
  .get('/callUserStatsTotal', [
    authorize(permission(RESOURCE.CALL)),
    carriers.getCallUserStatsTotal,
  ])
  // im
  .get('/im', [
    authorize(permission(RESOURCE.IM)),
    carriers.getIM,
  ])
  .get('/stats/im', [
    authorize(permission(RESOURCE.IM)),
    carriers.getIMStats,
  ])
  .get('/stats/im/monthly', [
    authorize(permission(RESOURCE.IM)),
    carriers.getIMMonthlyStats,
  ])
  .get('/stats/im/summary', [
    authorize(permission(RESOURCE.IM)),
    carriers.getIMSummaryStats,
  ])
  // sms
  .get('/sms', [
    authorize(permission(RESOURCE.SMS)),
    carriers.getSMS,
  ])
  .get('/stats/sms', [
    authorize(permission(RESOURCE.SMS)),
    carriers.getSMSStats,
  ])
  .get('/stats/sms/monthly', [
    authorize(permission(RESOURCE.SMS)),
    carriers.getSMSMonthlyStats,
  ])
  .get('/stats/sms/summary', [
    authorize(permission(RESOURCE.SMS)),
    carriers.getSMSSummaryStats,
  ])
  // top up
  .get('/topup', [
    authorize(permission(RESOURCE.TOP_UP)),
    carriers.getTopUp,
  ])
  // vsf
  .get('/vsf', [
    authorize(permission(RESOURCE.VSF)),
    carriers.getVSF,
  ])
  .get('/vsf/overview/summaryStats', [
    authorize(permission(RESOURCE.VSF)),
    carriers.getVsfSummaryStats,
  ])
  .get('/vsf/overview/monthlyStats', [
    authorize(permission(RESOURCE.VSF)),
    carriers.getVsfMonthlyStats,
  ])
  // verifications
  .get('/verifications', [
    authorize(permission(RESOURCE.VERIFICATION_SDK)),
    carriers.getVerifications,
  ])
  .get('/verificationStats', [
    authorize(permission(RESOURCE.VERIFICATION_SDK)),
    carriers.getVerificationStatistics,
  ])
  .get('/applicationIds', [
    authorize(permission(RESOURCE.VERIFICATION_SDK)),
    carriers.getApplicationIds,
  ])
  .get('/applications', [
    authorize(permission(RESOURCE.VERIFICATION_SDK)),
    carriers.getApplications,
  ])
  // used in the company provision section to get the preset information
  .get('/preset', [
    authorize(permission(RESOURCE.COMPANY, ACTION.UPDATE)),
    carriers.getPreset,
  ])
  // company wallet
  .get('/wallets', [
    authorize(permission(RESOURCE.COMPANY, ACTION.READ)),
    carrierWalletController.getWallets,
  ])
  .post('/topUpRecords', [
    authorize(permission(RESOURCE.COMPANY, ACTION.UPDATE)),
    carrierWalletController.createTopUpRecord,
  ])
  .get('/topUpRecords', [
    authorize(permission(RESOURCE.COMPANY, ACTION.READ)),
    carrierWalletController.getTopUpRecords,
  ])
  // used in account section
  .get('/accounts', [
    authorize(permission(RESOURCE.USER)),
    accounts.getAccounts,
  ])
  .post('/accounts', [
    authorize(permission(RESOURCE.USER, ACTION.CREATE)),
    accounts.createAccount,
  ])
  .get('/accounts/:id', [
    authorize(permission(RESOURCE.USER)),
    accounts.getAccount,
  ])
  .put('/accounts/:id', [
    authorize(permission(RESOURCE.USER, ACTION.UPDATE)),
    accounts.updateAccount,
  ])
  .delete('/accounts/:id', [
    authorize(permission(RESOURCE.USER, ACTION.DELETE)),
    accounts.deleteAccount,
  ])
  .post('/accounts/:id/requestSetPassword', [
    authorize(permission(RESOURCE.USER, ACTION.UPDATE)),
    accounts.requestSetPassword,
  ])
  // it will be used in the account page to get the possible companies and roles,
  // so it can be assgined to user
  .get('/companies/:companyId/managingCompanies', [
    authorize(permission(RESOURCE.USER)),
    companies.getManagingCompaniesRoles,
  ])
  // used in company section
  // only for provision status(complete) to update the company description
  .put('/companies/:companyId/profile', [
    authorize(permission(RESOURCE.COMPANY, ACTION.UPDATE)),
    companies.updateCompany,
  ])
  .post('/provisioning', [
    authorize(permission(RESOURCE.COMPANY, ACTION.CREATE)),
    provision.createProvision,
  ])
  .get('/provisioning', [
    authorize(permission(RESOURCE.COMPANY)),
    provision.getProvisions,
  ])
  .get('/provisioning/:provisionId', [
    authorize(permission(RESOURCE.COMPANY)),
    provision.getProvision,
  ])
  .put('/provisioning/:provisionId', [
    authorize(permission(RESOURCE.COMPANY, ACTION.UPDATE)),
    provision.putProvision,
  ])
  // used in the access management section
  .get('/roles', [
    authorize(permission(RESOURCE.ROLE)),
    roleController.list,
  ])
  .post('/roles', [
    authorize(permission(RESOURCE.ROLE, ACTION.CREATE)),
    roleController.create,
  ])
  .put('/roles/:id', [
    authorize(permission(RESOURCE.ROLE, ACTION.UPDATE)),
    roleController.update,
  ])
  .delete('/roles/:id', [
    authorize(permission(RESOURCE.ROLE, ACTION.DELETE)),
    roleController.remove,
  ]);

export default apiRouter;
