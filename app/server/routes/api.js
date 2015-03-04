import { Router }         from 'express';
import nconf              from 'nconf';
import { fetchDep }       from 'app/server/initializers/ioc';
import Controller         from 'app/server/api';

var endUserRequest        = fetchDep(nconf.get('containerName'), 'EndUserRequest');
var transactionRequest    = fetchDep(nconf.get('containerName'), 'TransactionRequest');
var vsfTransactionRequest = fetchDep(nconf.get('containerName'), 'VSFTransactionRequest');
var walletRequest         = fetchDep(nconf.get('containerName'), 'WalletRequest');
var apiCtrl               = new Controller(endUserRequest, transactionRequest, walletRequest);

var router = Router({ mergeParams: true });

router.get('/carriers/:carrierId/users', function(req, res, next) {
  return apiCtrl.listEndUsers(req, res, next);
});

router.get('/carriers/:carrierId/users/:username', function(req, res, next) {
  return apiCtrl.getEndUserDetails(req, res, next);
});

router.post('/carriers/:carrierId/users/:username/suspension', function(req, res, next) {
  return apiCtrl.suspendEndUser(req, res, next);
});

router.put('/carriers/:carrierId/whitelist', function(req, res, next) {
  return apiCtrl.whitelistUsers(req, res, next);
});

router.delete('/carriers/:carrierId/users/:username/suspension', function(req, res, next) {
  return apiCtrl.reactivateEndUser(req, res, next);
});

router.delete('/carriers/:carrierId/users/:username', function(req, res, next) {
  return apiCtrl.terminateEndUser(req, res, next);
});

router.post('/transactionHistory', function(req, res, next) {
  return apiCtrl.getTransactions(req, res, next);
});

export default router;



