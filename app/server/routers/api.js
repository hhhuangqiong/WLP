import { Router } from 'express';
import nconf from 'nconf';

import * as auth from '../routes/auth';
import * as carriers from '../routes/carriers';
import * as companies from '../routes/companies';
import * as authority from '../routes/authority';
import * as accounts from '../routes/accounts';

import cacheControl from '../middlewares/cacheControl';
import {
  createAuthorizationMiddleware as authorize,
} from '../middlewares/authorization';
import { fetchDep } from '../utils/bottle';

const multipart = require('connect-multiparty')();
const router = new Router();

const fetchPermissions = fetchDep(nconf.get('containerName'), 'FetchPermissionsMiddleware');

// eslint:max-len 0

router
  .use(cacheControl)
  .use(fetchPermissions)
  .get('/session', auth.getSession)
  .get('/accounts/verify/:token', accounts.verifyToken)
  .put('/accounts/verify/:token', accounts.createPassword)
  .put('/accounts/reverify/:username', accounts.reverifyAccount)
  .get('/carriers/:carrierId/overview/summaryStats', [
    authorize('wlp:generalOverview:read'),
    carriers.getOverviewSummaryStats,
  ])
  .get('/carriers/:carrierId/overview/detailStats', [
    authorize('wlp:generalOverview:read'),
    carriers.getOverviewDetailStats,
  ])
  .get('/carriers/:carrierId/authority', authority.getCapabilityList)
  .get('/carriers/:carrierId/users', [
    authorize('wlp:endUser:read'),
    carriers.getUsers,
  ])
  .get('/carriers/:carrierId/users/whitelist/:username?', [
    authorize('wlp:endUser:read'),
    carriers.getWhitelist,
  ])
  .post('/carriers/:carrierId/users/whitelist', [
    authorize('wlp:endUser:update'),
    carriers.addWhitelist,
  ])
  .delete('/carriers:/:carrierId/users/whitelist', [
    authorize('wlp:endUser:update'),
    carriers.removeWhitelist,
  ])
  // TODO: change userStatsTotal and userStatsMonthly
  .get('/carriers/:carrierId/userStatsTotal', [
    authorize('wlp:endUser:read'),
    carriers.getEndUsersStatsTotal,
  ])
  .get('/carriers/:carrierId/userStatsMonthly', [
    authorize('wlp:endUser:read'),
    carriers.getEndUsersStatsMonthly,
  ])
  .get('/carriers/:carrierId/stat/user/query', [
    authorize('wlp:endUser:read'),
    carriers.getEndUsersStats,
  ])
  .get('/carriers/:carrierId/users/:username', [
    authorize('wlp:endUser:read'),
    carriers.getUsername,
  ])
  .get('/carriers/:carrierId/users/:username/wallet', [
    authorize('wlp:endUser:read'),
    carriers.getUserWallet,
  ])
  .post('/carriers/:carrierId/users/:username/suspension', [
    authorize('wlp:endUser:update'),
    carriers.suspendUser,
  ])
  .delete('/carriers/:carrierId/users/:username/suspension', [
    authorize('wlp:endUser:update'),
    carriers.reactivateUser,
  ])
  .get('/carriers/:carrierId/calls', [
    authorize('wlp:callDetails:read'),
    carriers.getCalls,
  ])
  .get('/carriers/:carrierId/callUserStatsMonthly', [
    authorize('wlp:callOverview:read'),
    carriers.getCallUserStatsMonthly,
  ])
  .get('/carriers/:carrierId/callUserStatsTotal', [
    authorize('wlp:callOverview:read'),
    carriers.getCallUserStatsTotal,
  ])
  .get('/carriers/:carrierId/im', [
    authorize('wlp:imDetails:read'),
    carriers.getIM,
  ])
  .get('/carriers/:carrierId/stats/im', [
    authorize('wlp:imOverview:read'),
    carriers.getIMStats,
  ])
  .get('/carriers/:carrierId/stats/im/monthly', [
    authorize('wlp:imOverview:read'),
    carriers.getIMMonthlyStats,
  ])
  .get('/carriers/:carrierId/stats/im/summary', [
    authorize('wlp:imOverview:read'),
    carriers.getIMSummaryStats,
  ])
  .get('/carriers/:carrierId/sms', [
    authorize('wlp:smsDetails:read'),
    carriers.getSMS,
  ])
  .get('/carriers/:carrierId/stats/sms', [
    authorize('wlp:smsOverview:read'),
    carriers.getSMSStats,
  ])
  .get('/carriers/:carrierId/stats/sms/monthly', [
    authorize('wlp:smsOverview:read'),
    carriers.getSMSMonthlyStats,
  ])
  .get('/carriers/:carrierId/stats/sms/summary', [
    authorize('wlp:smsOverview:read'),
    carriers.getSMSSummaryStats,
  ])
  .get('/carriers/:carrierId/topup', [
    authorize('wlp:topUp:read'),
    carriers.getTopUp,
  ])
  .get('/carriers/:carrierId/vsf', [
    authorize('wlp:vsfDetails:read'),
    carriers.getVSF,
  ])
  .get('/carriers/:carrierId/vsf/overview/summaryStats', [
    authorize('wlp:vsfOverview:read'),
    carriers.getVsfSummaryStats,
  ])
  .get('/carriers/:carrierId/vsf/overview/monthlyStats', [
    authorize('wlp:vsfOverview:read'),
    carriers.getVsfMonthlyStats,
  ])
  .get('/carriers/:carrierId/verifications', [
    // TODO: define authorization resources and actions
    carriers.getVerifications,
  ])
  .get('/carriers/:carrierId/verificationStats', [
    // TODO: define authorization resources and actions
    carriers.getVerificationStatistics,
  ])
  .get('/companies', [
    authorize('company:read'),
    companies.list,
  ])
  .get('/accounts', [
    authorize('user:read'),
    accounts.getAccounts,
  ])
  .post('/accounts', [
    authorize('user:create'),
    accounts.createAccount,
  ])
  .post('/accounts/change-password', [
    authorize('user:update'),
    accounts.changePassword,
  ])
  .get('/accounts/managingCompanies', [
    authorize('user:read'),
    companies.getApplicationCompanies,
  ])
  .put('/accounts/:userId', [
    authorize('user:update'),
    accounts.updateAccount,
  ])
  .delete('/accounts/:userId', [
    authorize('user:delete'),
    accounts.deleteAccount,
  ])
  .post('/companies', [
    authorize('company:create'),
    multipart,
    companies.createProfile,
  ])
  .get('/companies/:carrierId/info', [
    authorize('company:read'),
    companies.getInfo,
  ])
  .get('/companies/:carrierId/service', [
    authorize('company:read'),
    companies.getService,
  ])
  .get('/companies/:carrierId/applications', [
    authorize('company:read'),
    companies.getApplications,
  ])
  .get('/companies/:carrierId/applicationIds', [
    authorize('company:read'),
    companies.getApplicationIds,
  ])
  .put('/companies/:carrierId/profile', [
    authorize('company:update'),
    multipart,
    companies.updateProfile,
  ])
  .put('/companies/:carrierId/service', [
    authorize('company:update'),
    multipart,
    companies.saveService,
  ])
  .get('/accessibleCompanies', [
    authorize('company:read'),
    companies.getAccessibleCompanies
  ])
  .get('/companies/parent', [
    authorize('company:read'),
    companies.getParents,
  ])
  .post('/companies/:carrierId/suspension', [
    authorize('company:delete'),
    companies.deactivateCompany,
  ])
  .put('/companies/:carrierId/suspension', [
    authorize('company:delete'),
    companies.reactivateCompany,
  ])
  .use('*', (req, res) => res.status(400).json({
    error: {
      name: 'Unknown URL',
      message: `No endpoint for the given URL ${req.originalUrl}`,
    },
  }));

export default router;
