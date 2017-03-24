import { Router } from 'express';
import multer from 'multer';
import { permission, RESOURCE, ACTION, RESOURCE_OWNER } from './../../main/acl/acl-enums';

export function api(
  noCacheMiddleware,
  authorize,
  ensureAuthenticatedMiddleware,
  decodeParamsMiddeware,
  controllers,
) {
  const {
    roleController,
    companyController,
    accountController,
    provisionController,
    resourceController,
    carrierRateController,
    carrierWalletController,
    meController,
    imController,
    callController,
    userController,
    overviewController,
    signUpController,
    topUpController,
    smsController,
    vsfController,
    verificationController,
    applicationController,
  } = controllers;
  // apply the memory storage when upload file
  const storage = multer.memoryStorage();
  const uploadFile = multer({ storage });

  // Merge params is used to inherit carrierId from common parent router
  const routes = new Router({ mergeParams: true });
  const apiRouter = new Router();

  apiRouter
  // check the existence of req.user, throw 401 when not exist
  .use(ensureAuthenticatedMiddleware)
  .use(decodeParamsMiddeware)
  // company logo has no permission checking
  .use('/companies/logo', companyController.getLogo())
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
    overviewController.getOverviewSummaryStats,
  ])
  .get('/overview/detailStats', [
    authorize(permission(RESOURCE.GENERAL)),
    overviewController.getOverviewDetailStats,
  ])
  // signupRules
  .get('/signupRules', [
    authorize(permission(RESOURCE.WHITELIST)),
    signUpController.getSignupRules,
  ])
  .post('/signupRules', [
    authorize(permission(RESOURCE.WHITELIST, ACTION.CREATE)),
    signUpController.createSignupRules,
  ])
  .delete('/signupRules/:id', [
    authorize(permission(RESOURCE.WHITELIST, ACTION.DELETE)),
    signUpController.deleteSignupRule,
  ])
  // TODO: change userStatsTotal and userStatsMonthly
  // end users
  .get('/users', [
    authorize(permission(RESOURCE.END_USER)),
    userController.getUsers,
  ])
  .get('/userStatsTotal', [
    authorize(permission(RESOURCE.END_USER)),
    userController.getEndUsersStatsTotal,
  ])
  .get('/userStatsMonthly', [
    authorize(permission(RESOURCE.END_USER)),
    userController.getEndUsersStatsMonthly,
  ])
  .get('/stat/user/query', [
    authorize(permission(RESOURCE.END_USER)),
    userController.getEndUsersStats,
  ])
  .get('/users/:username', [
    authorize(permission(RESOURCE.END_USER)),
    userController.getUsername,
  ])
  .get('/users/:username/wallet', [
    authorize(permission(RESOURCE.END_USER)),
    userController.getUserWallet,
  ])
  .post('/users/:username/suspension', [
    authorize(permission(RESOURCE.END_USER, ACTION.UPDATE)),
    userController.suspendUser,
  ])
  .delete('/users/:username/suspension', [
    authorize(permission(RESOURCE.END_USER, ACTION.UPDATE)),
    userController.reactivateUser,
  ])
  // calls
  .get('/calls', [
    authorize(permission(RESOURCE.CALL)),
    callController.getCalls,
  ])
  .get('/callUserStatsMonthly', [
    authorize(permission(RESOURCE.CALL)),
    callController.getCallUserStatsMonthly,
  ])
  .get('/callUserStatsTotal', [
    authorize(permission(RESOURCE.CALL)),
    callController.getCallUserStatsTotal,
  ])
  // im
  .get('/im', [
    authorize(permission(RESOURCE.IM)),
    imController.getIM,
  ])
  .get('/stats/im', [
    authorize(permission(RESOURCE.IM)),
    imController.getIMStats,
  ])
  .get('/stats/im/monthly', [
    authorize(permission(RESOURCE.IM)),
    imController.getIMMonthlyStats,
  ])
  .get('/stats/im/summary', [
    authorize(permission(RESOURCE.IM)),
    imController.getIMSummaryStats,
  ])
  // sms
  .get('/sms', [
    authorize(permission(RESOURCE.SMS)),
    smsController.getSMS,
  ])
  .get('/stats/sms', [
    authorize(permission(RESOURCE.SMS)),
    smsController.getSMSStats,
  ])
  .get('/stats/sms/monthly', [
    authorize(permission(RESOURCE.SMS)),
    smsController.getSMSMonthlyStats,
  ])
  .get('/stats/sms/summary', [
    authorize(permission(RESOURCE.SMS)),
    smsController.getSMSSummaryStats,
  ])
  // top up
  .get('/topup', [
    authorize(permission(RESOURCE.TOP_UP)),
    topUpController.getTopUp,
  ])
  // vsf
  .get('/vsf', [
    authorize(permission(RESOURCE.VSF)),
    vsfController.getVSF,
  ])
  .get('/vsf/overview/summaryStats', [
    authorize(permission(RESOURCE.VSF)),
    vsfController.getVsfSummaryStats,
  ])
  .get('/vsf/overview/monthlyStats', [
    authorize(permission(RESOURCE.VSF)),
    vsfController.getVsfMonthlyStats,
  ])
  // verifications
  .get('/verifications', [
    authorize(permission(RESOURCE.VERIFICATION_SDK)),
    verificationController.getVerifications,
  ])
  .get('/verificationStats', [
    authorize(permission(RESOURCE.VERIFICATION_SDK)),
    verificationController.getVerificationStatistics,
  ])
  .get('/applicationIds', [
    authorize(permission(RESOURCE.VERIFICATION_SDK)),
    applicationController.getApplicationIds,
  ])
  .get('/applications', [
    authorize(permission(RESOURCE.VERIFICATION_SDK)),
    applicationController.getApplications,
  ])
  // used in the company provision section to get the preset information
  .get('/preset', [
    authorize(permission(RESOURCE.COMPANY, ACTION.UPDATE)),
    provisionController.getPreset,
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
    accountController.getAccounts,
  ])
  .post('/accounts', [
    authorize(permission(RESOURCE.USER, ACTION.CREATE)),
    accountController.createAccount,
  ])
  .get('/accounts/:id', [
    authorize(permission(RESOURCE.USER)),
    accountController.getAccount,
  ])
  .put('/accounts/:id', [
    authorize(permission(RESOURCE.USER, ACTION.UPDATE)),
    accountController.updateAccount,
  ])
  .delete('/accounts/:id', [
    authorize(permission(RESOURCE.USER, ACTION.DELETE)),
    accountController.deleteAccount,
  ])
  .post('/accounts/:id/requestSetPassword', [
    authorize(permission(RESOURCE.USER, ACTION.UPDATE)),
    accountController.requestSetPassword,
  ])
  // company controller will be used to manage the carrier,
  // it will convert the carrier id into company id
  // managingCompanies will be used in the account page to get the possible companies and roles,
  // so it can be assgined to user
  .get('/managingCompaniesRoles', [
    authorize(permission(RESOURCE.USER)),
    companyController.getManagingCompaniesRoles,
  ])
  // used in company section
  // only for provision status(complete) to update the company description
  .put('/company/:companyId/profile', [
    authorize(permission(RESOURCE.COMPANY, ACTION.UPDATE)),
    companyController.updateCompany,
  ])
  .delete('/company/:companyId/logo', [
    authorize(permission(RESOURCE.COMPANY, ACTION.UPDATE)),
    companyController.deleteLogo,
  ])
  .put('/company/:companyId/logo', [
    authorize(permission(RESOURCE.COMPANY, ACTION.UPDATE)),
    uploadFile.single('logo'),
    companyController.updateLogo,
  ])
  .post('/provisioning', [
    authorize(permission(RESOURCE.COMPANY, ACTION.CREATE)),
    uploadFile.single('logo'),
    provisionController.createProvision,
  ])
  .get('/provisioning', [
    authorize(permission(RESOURCE.COMPANY)),
    provisionController.getProvisions,
  ])
  .get('/provisioning/:provisionId', [
    authorize(permission(RESOURCE.COMPANY)),
    provisionController.getProvision,
  ])
  .put('/provisioning/:provisionId', [
    authorize(permission(RESOURCE.COMPANY, ACTION.UPDATE)),
    provisionController.putProvision,
  ])
  // used in the access management section
  .get('/resource', [
    authorize(permission(RESOURCE.ROLE)),
    resourceController.getCarrierResources,
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

  return apiRouter;
}

export default api;
