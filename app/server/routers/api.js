import { Router } from 'express';

import { SIGN_IN, SIGN_OUT } from '../paths';

import * as auth from '../routes/auth';
import * as carriers from '../routes/carriers';
import * as companies from '../routes/companies';
import * as authority from '../routes/authority';
import * as accounts from '../routes/accounts';

import cacheControl from '../middlewares/cacheControl';

const multipart = require('connect-multiparty')();
const router = Router();

router
  .use(cacheControl)
  .post(SIGN_IN, auth.signIn)
  .post(SIGN_OUT, auth.signOut)
  .get('/accounts/verify/:token', accounts.verifyToken)
  .put('/accounts/verify/:token', accounts.createPassword)
  .put('/accounts/reverify/:username', accounts.reverifyAccount)
  .use(auth.validateToken)
  .get('/session', auth.ensureAuthenticated)
  .get('/carriers/:carrierId/authority', authority.getCapabilityList)
  .get('/carriers/:carrierId/users', carriers.getUsers)
  // TODO: change userStatsTotal and userStatsMonthly
  .get('/carriers/:carrierId/userStatsTotal', carriers.getEndUsersStatsTotal)
  .get('/carriers/:carrierId/userStatsMonthly', carriers.getEndUsersStatsMonthly)
  .get('/carriers/:carrierId/stat/user/query', carriers.getEndUsersStats)
  .get('/carriers/:carrierId/users/:username', carriers.getUsername)
  .get('/carriers/:carrierId/users/:username/wallet', carriers.getUserWallet)
  .post('/carriers/:carrierId/users/:username/suspension', carriers.suspendUser)
  .delete('/carriers/:carrierId/users/:username/suspension', carriers.reactivateUser)
  .get('/carriers/:carrierId/calls', carriers.getCalls)
  .get('/carriers/:carrierId/callUserStatsMonthly', carriers.getCallUserStatsMonthly)
  .get('/carriers/:carrierId/callUserStatsTotal', carriers.getCallUserStatsTotal)
  .get('/carriers/:carrierId/im', carriers.getIM)
  .get('/carriers/:carrierId/sms', carriers.getSMS)
  .get('/carriers/:carrierId/topup', carriers.getTopUp)
  .get('/carriers/:carrierId/vsf', carriers.getVSF)
  .get('/carriers/:carrierId/verifications', carriers.getVerifications)
  .get('/carriers/:carrierId/verificationStats', carriers.getVerificationStatistics)
  .get('/carriers/:carrierId/widgets/:type(calls|im|overview|store|sms|vsf)', carriers.getWidgets)
  .get('/companies', companies.list)
  .get('/accounts', accounts.getAccounts)
  .post('/accounts', accounts.createAccount)
  .post('/accounts/change-password', accounts.changePassword)
  .get('/accounts/managingCompanies', companies.getApplicationCompanies)
  .put('/accounts/:userId', accounts.updateAccount)
  .delete('/accounts/:userId', accounts.deleteAccount)
  .post('/companies', multipart, companies.createProfile)
  .get('/companies/:carrierId/info', companies.getInfo)
  .get('/companies/:carrierId/service', companies.getService)
  .get('/companies/:carrierId/applications', companies.getApplications)
  .get('/companies/:carrierId/applicationIds', companies.getApplicationIds)
  .put('/companies/:carrierId/profile', multipart, companies.updateProfile)
  .put('/companies/:carrierId/service', multipart, companies.saveService)
  .put('/companies/:carrierId/widget', multipart, companies.saveWidget)
  .get('/companies/:carrierId/managingCompanies', companies.getCarrierCompanies)
  .get('/companies/parent', companies.getParents)
  .post('/companies/:carrierId/suspension', companies.deactivateCompany)
  .put('/companies/:carrierId/suspension', companies.reactivateCompany)
  .use('*', (req, res) => res.status(400).json({
    error: {
      name: 'Unknown URL',
      message: `No endpoint for the given URL ${req.originalUrl}`,
    },
  }));

export default router;
