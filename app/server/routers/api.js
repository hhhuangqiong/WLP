import { Router } from 'express';
import nconf from 'nconf';

import * as carriers from '../routes/carriers';
import * as companies from '../routes/companies';
import * as accounts from '../routes/accounts';
import * as provision from '../routes/provision';

import cacheControl from '../middlewares/cacheControl';
import {
  createAuthorizationMiddleware as authorize,
} from '../middlewares/authorization';
import { permission, RESOURCE, ACTION } from './../../main/acl/acl-enums';
import { fetchDep } from './../utils/bottle';

const router = new Router();

// TODO: refactor api.js to be a factory function with dependencies
const roleController = fetchDep(nconf.get('containerName'), 'RoleController');

// eslint:max-len 0
router
  .use(cacheControl)
  .get('/carriers/:carrierId/company',
    carriers.getCompany,
  )
  .get('/carriers/:carrierId/overview/summaryStats', [
    authorize(permission(RESOURCE.GENERAL)),
    carriers.getOverviewSummaryStats,
  ])
  .get('/carriers/:carrierId/overview/detailStats', [
    authorize(permission(RESOURCE.GENERAL)),
    carriers.getOverviewDetailStats,
  ])
  .get('/carriers/:carrierId/users', [
    authorize(permission(RESOURCE.END_USER)),
    carriers.getUsers,
  ])
  .get('/carriers/:carrierId/users/whitelist/:username?', [
    authorize(permission(RESOURCE.END_USER)),
    carriers.getWhitelist,
  ])
  .post('/carriers/:carrierId/users/whitelist', [
    authorize(permission(RESOURCE.END_USER, ACTION.CREATE)),
    carriers.addWhitelist,
  ])
  .delete('/carriers:/:carrierId/users/whitelist', [
    authorize(permission(RESOURCE.END_USER, ACTION.DELETE)),
    carriers.removeWhitelist,
  ])
  // TODO: change userStatsTotal and userStatsMonthly
  .get('/carriers/:carrierId/userStatsTotal', [
    authorize(permission(RESOURCE.END_USER)),
    carriers.getEndUsersStatsTotal,
  ])
  .get('/carriers/:carrierId/userStatsMonthly', [
    authorize(permission(RESOURCE.END_USER)),
    carriers.getEndUsersStatsMonthly,
  ])
  .get('/carriers/:carrierId/stat/user/query', [
    authorize(permission(RESOURCE.END_USER)),
    carriers.getEndUsersStats,
  ])
  .get('/carriers/:carrierId/users/:username', [
    authorize(permission(RESOURCE.END_USER)),
    carriers.getUsername,
  ])
  .get('/carriers/:carrierId/users/:username/wallet', [
    authorize(permission(RESOURCE.END_USER)),
    carriers.getUserWallet,
  ])
  .post('/carriers/:carrierId/users/:username/suspension', [
    authorize(permission(RESOURCE.END_USER, ACTION.UPDATE)),
    carriers.suspendUser,
  ])
  .delete('/carriers/:carrierId/users/:username/suspension', [
    authorize(permission(RESOURCE.END_USER, ACTION.UPDATE)),
    carriers.reactivateUser,
  ])
  .get('/carriers/:carrierId/calls', [
    authorize(permission(RESOURCE.CALL)),
    carriers.getCalls,
  ])
  .get('/carriers/:carrierId/callUserStatsMonthly', [
    authorize(permission(RESOURCE.CALL)),
    carriers.getCallUserStatsMonthly,
  ])
  .get('/carriers/:carrierId/callUserStatsTotal', [
    authorize(permission(RESOURCE.CALL)),
    carriers.getCallUserStatsTotal,
  ])
  .get('/carriers/:carrierId/im', [
    authorize(permission(RESOURCE.IM)),
    carriers.getIM,
  ])
  .get('/carriers/:carrierId/stats/im', [
    authorize(permission(RESOURCE.IM)),
    carriers.getIMStats,
  ])
  .get('/carriers/:carrierId/stats/im/monthly', [
    authorize(permission(RESOURCE.IM)),
    carriers.getIMMonthlyStats,
  ])
  .get('/carriers/:carrierId/stats/im/summary', [
    authorize(permission(RESOURCE.IM)),
    carriers.getIMSummaryStats,
  ])
  .get('/carriers/:carrierId/sms', [
    authorize(permission(RESOURCE.SMS)),
    carriers.getSMS,
  ])
  .get('/carriers/:carrierId/stats/sms', [
    authorize(permission(RESOURCE.SMS)),
    carriers.getSMSStats,
  ])
  .get('/carriers/:carrierId/stats/sms/monthly', [
    authorize(permission(RESOURCE.SMS)),
    carriers.getSMSMonthlyStats,
  ])
  .get('/carriers/:carrierId/stats/sms/summary', [
    authorize(permission(RESOURCE.SMS)),
    carriers.getSMSSummaryStats,
  ])
  .get('/carriers/:carrierId/topup', [
    authorize(permission(RESOURCE.TOP_UP)),
    carriers.getTopUp,
  ])
  .get('/carriers/:carrierId/vsf', [
    authorize(permission(RESOURCE.VSF)),
    carriers.getVSF,
  ])
  .get('/carriers/:carrierId/vsf/overview/summaryStats', [
    authorize(permission(RESOURCE.VSF)),
    carriers.getVsfSummaryStats,
  ])
  .get('/carriers/:carrierId/vsf/overview/monthlyStats', [
    authorize(permission(RESOURCE.VSF)),
    carriers.getVsfMonthlyStats,
  ])
  .get('/carriers/:carrierId/verifications', [
    authorize(permission(RESOURCE.VERIFICATION_SDK)),
    carriers.getVerifications,
  ])
  .get('/carriers/:carrierId/verificationStats', [
    authorize(permission(RESOURCE.VERIFICATION_SDK)),
    carriers.getVerificationStatistics,
  ])
  .get('/carriers/:carrierId/applicationIds', [
    authorize(permission(RESOURCE.VERIFICATION_SDK)),
    carriers.getApplicationIds,
  ])
  .get('/carriers/:carrierId/applications', [
    authorize(permission(RESOURCE.VERIFICATION_SDK)),
    carriers.getApplications,
  ])
  // @expect to use on both update and create, but fail
  .get('/carriers/:carrierId/preset', [
    authorize(permission(RESOURCE.COMPANY, ACTION.UPDATE)),
    carriers.getPreset,
  ])
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
  .get('/companies/:companyId/profile', [
    authorize(permission(RESOURCE.COMPANY)),
    companies.getCompany,
  ])
  // it will be used in the account page to get the possible companies under and assign roles
  .get('/companies/:companyId/managingCompanies', [
    authorize(permission(RESOURCE.USER)),
    companies.getManagingCompanies,
  ])
  .put('/companies/:companyId/profile', [
    authorize(permission(RESOURCE.COMPANY, ACTION.UPDATE)),
    companies.updateCompany,
  ])
  // @TODO no such use case and function
  .post('/companies/:companyId/suspension', [
    authorize(permission(RESOURCE.COMPANY, ACTION.UPDATE)),
    companies.deactivateCompany,
  ])
  // @TODO no such use case and function
  .put('/companies/:companyId/suspension', [
    authorize(permission(RESOURCE.COMPANY, ACTION.UPDATE)),
    companies.reactivateCompany,
  ])
  .get('/companies/:companyId/roles', [
    authorize(permission(RESOURCE.ROLE)),
    companies.getCompanyRoles,
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
  ])
  .use('*', (req, res) => res.status(400).json({
    error: {
      name: 'Unknown URL',
      message: `No endpoint for the given URL ${req.originalUrl}`,
    },
  }));

export default router;
