import { Router } from 'express';
import multer from 'multer';
import { permission, RESOURCE, ACTION, RESOURCE_OWNER } from './../../main/acl/acl-enums';
import { fetchDep } from './../utils/bottle';

// TODO: refactor api.js to be a factory function with dependencies
const noCacheMiddleware = fetchDep('NoCacheMiddleware');
const authorize = fetchDep('AuthorizationMiddlewareFactory');
const ensureAuthenticatedMiddleware = fetchDep('EnsureAuthenticatedMiddleware');
const roleController = fetchDep('RoleController');
const companies = fetchDep('CompanyController');
const accounts = fetchDep('AccountController');
const provision = fetchDep('ProvisionController');
const carriers = fetchDep('CarrierController');
const resources = fetchDep('ResourceController');
const carrierRateController = fetchDep('CarrierRateController');
const carrierWalletController = fetchDep('CarrierWalletController');
const meController = fetchDep('MeController');
const decodeParamsMiddeware = fetchDep('DecodeParamsMiddeware');

// Merge params is used to inherit carrierId from common parent router
const routes = new Router({ mergeParams: true });
const apiRouter = new Router();
// apply the memory storage when upload file
const storage = multer.memoryStorage();
const uploadFile = multer({ storage });
apiRouter
  // check the existence of req.user, throw 401 when not exist
  .use(ensureAuthenticatedMiddleware)
  .use(decodeParamsMiddeware)
  // company logo has no permission checking
  .use('/companies/logo', companies.getLogo())
  // undergo the authorization checking base on permission
  .use('/carriers/:carrierId', routes)
  .use('*', (req, res) => res.status(400).json({
    error: {
      name: 'Unknown URL',
      message: `No endpoint for the given URL ${req.originalUrl}`,
    },
  }));

// eslint:max-len 0
routes
  .use(noCacheMiddleware)
  .get('/me', meController.getCurrentUser)
  .get('/me/companies', meController.getCompanies)
  // general overview
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
  // signupRules
  .get('/signupRules', [
    authorize(permission(RESOURCE.WHITELIST)),
    carriers.getSignupRules,
  ])
  .post('/signupRules', [
    authorize(permission(RESOURCE.WHITELIST, ACTION.CREATE)),
    carriers.createSignupRules,
  ])
  .delete('/signupRules/:id', [
    authorize(permission(RESOURCE.WHITELIST, ACTION.DELETE)),
    carriers.deleteSignupRule,
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
  // company charging rate
  .get('/smsRate', [
    authorize(permission(RESOURCE.COMPANY, ACTION.READ), RESOURCE_OWNER.PARENT_COMPANY),
    carrierRateController.getSMSRate,
  ])
  .get('/callRate', [
    authorize(permission(RESOURCE.COMPANY, ACTION.READ), RESOURCE_OWNER.PARENT_COMPANY),
    carrierRateController.getCallRate,
  ])
  // company wallet
  .get('/wallets', [
    authorize(permission(RESOURCE.COMPANY, ACTION.READ), RESOURCE_OWNER.PARENT_COMPANY),
    carrierWalletController.getWallets,
  ])
  .post('/topUpRecords', [
    authorize(permission(RESOURCE.COMPANY, ACTION.UPDATE), RESOURCE_OWNER.PARENT_COMPANY),
    carrierWalletController.createTopUpRecord,
  ])
  .get('/topUpRecords', [
    authorize(permission(RESOURCE.COMPANY, ACTION.READ), RESOURCE_OWNER.PARENT_COMPANY),
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
  // company controller will be used to manage the carrier,
  // it will convert the carrier id into company id
  // managingCompanies will be used in the account page to get the possible companies and roles,
  // so it can be assgined to user
  .get('/managingCompaniesRoles', [
    authorize(permission(RESOURCE.USER)),
    companies.getManagingCompaniesRoles,
  ])
  // used in company section
  // only for provision status(complete) to update the company description
  .put('/company/:companyId/profile', [
    authorize(permission(RESOURCE.COMPANY, ACTION.UPDATE)),
    companies.updateCompany,
  ])
  .post('/provisioning', [
    authorize(permission(RESOURCE.COMPANY, ACTION.CREATE)),
    uploadFile.single('logo'),
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
  .get('/resource', [
    authorize(permission(RESOURCE.ROLE)),
    resources.getCarrierResources,
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
  ]);

export default apiRouter;
