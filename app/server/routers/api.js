import { Router } from 'express';

import { SIGN_IN, SIGN_OUT } from '../paths';

import * as auth      from '../routes/auth';
import * as carriers  from '../routes/carriers';
import * as companies from '../routes/companies';
import * as authority from '../routes/authority';

let multipart = require('connect-multiparty')();

let router = Router();

router
  .post(SIGN_IN, auth.signIn)
  .post(SIGN_OUT, auth.signOut)
  .use(auth.validateToken)
  .get('/session', auth.ensureAuthenticated)
  .get('/carriers/:carrierId/authority', authority.getCapabilityList)
  .get('/carriers/:carrierId/users', carriers.getUsers)
  .get('/carriers/:carrierId/users/:username',  carriers.getUsername)
  .get('/carriers/:carrierId/users/:username/wallet', carriers.getUserWallet)
  .post('/carriers/:carrierId/users/:username/suspension', carriers.suspendUser)
  .delete('/carriers/:carrierId/users/:username', carriers.terminateUser)
  .delete('/carriers/:carrierId/users/:username/suspension', carriers.reactivateUser)
  .get('/carriers/:carrierId/calls', carriers.getCalls)
  .get('/carriers/:carrierId/im', carriers.getIM)
  .get('/carriers/:carrierId/sms', carriers.getSMS)
  .get('/carriers/:carrierId/topup', carriers.getTopUp)
  .get('/carriers/:carrierId/vsf', carriers.getVSF)
  .get('/carriers/:carrierId/verifications', carriers.getVerifications)
  .get('/carriers/:carrierId/verificationStats', carriers.getVerificationStatistics)
  .get('/carriers/:carrierId/widgets/:type(calls|im|overview|store|sms|vsf)', carriers.getWidgets)
  .get('/companies', companies.list)
  .post('/companies', multipart, companies.createProfile)
  .get('/companies/:carrierId/info', companies.getInfo)
  .get('/companies/:carrierId/service', companies.getService)
  .get('/companies/:carrierId/applications', companies.getApplications)
  .get('/companies/:carrierId/applicationIds', companies.getApplicationIds)
  .put('/companies/:carrierId/profile', multipart, companies.updateProfile)
  .put('/companies/:carrierId/service', multipart, companies.saveService)
  .put('/companies/:carrierId/widget', multipart, companies.saveWidget)
  .get('/application/companies', companies.getApplicationCompanies)
  .get('/companies/parent', companies.getParents)
  .post('/companies/:carrierId/suspension', companies.deactivateCompany)
  .put('/companies/:carrierId/suspension', companies.reactivateCompany)
  .use('*', function(req, res) {
    return res.status(400).json({
      error: {
        name: 'Unknown URL',
        message: `No endpoint for the given URL ${req.originalUrl}`
      }
    });
  });

export default router;
