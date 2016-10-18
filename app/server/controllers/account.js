import _ from 'lodash';
import moment from 'moment';

const debug = require('debug')('app:controllers/api');

function formatAccountData(account) {
  if (!account.name) {
    return account;
  }

  const formattedAccount = _.omit(account, 'name');
  formattedAccount.name = {
    givenName: account.name.firstName,
    familyName: account.name.lastName,
  };
  return formattedAccount;
}

function formatAccountResult(user) {
  const userInfo = {
    id: user.id,
    name: {
      firstName: user.name && user.name.givenName || '',
      lastName: user.name && user.name.familyName || '',
    },
    affiliatedCompany: user.affiliatedCompany,
    isVerified: user.isVerified,
    createdAt: moment(user.createdAt).format('LLL'),
    updatedAt: moment(user.updatedAt).format('LLL'),
  };
  return userInfo;
}

export default function accountController(iamServiceClient, provisionHelper) {
  // get Accounts result will return simple data without carrierId and role
  async function getAccounts(req, res, next) {
    debug('get accounts via account controller');
    try {
      const command = req.query;
      command.affiliatedCompany = await provisionHelper.getCompanyIdByCarrierId(req.params.carrierId);
      // @TODO temporary set the page size to 50 and expect fetch all users
      // wait IAM to have no pagination support
      command.pageSize = req.query.pageSize || 50;
      const result = await iamServiceClient.getUsers(command);
      // format the users which is
      result.items = _.map(result.items, formatAccountResult);
      res.json(result);
    } catch (ex) {
      next(ex);
    }
  }

  // create Account result will return data with carrierId without roles
  async function createAccount(req, res, next) {
    debug('create account via account controller');
    try {
      // separate roles into another request
      const createUserdata = _.omit(formatAccountData(req.body), 'roles');
      const result = await iamServiceClient.createUser(createUserdata);
      debug('created and get back the user information', result);
      const user = await iamServiceClient.getUser({ id: result.id });
      const userInfo = formatAccountResult(user);
      // get the carrier
      userInfo.carrierId = await provisionHelper.getCarrierIdByCompanyId(user.affiliatedCompany);
      // add the roles
      if (req.body.roles) {
        await iamServiceClient.setUserRoles({ userId: user.id, roles: req.body.roles });
      }
      // request for set password email
      await iamServiceClient.requestSetPassword({ id: user.id });
      res.json(userInfo);
    } catch (err) {
      next(err);
    }
  }

  async function requestSetPassword(req, res, next) {
    try {
      await iamServiceClient.requestSetPassword({ id: req.params.id });
    } catch (err) {
      next(err);
    }
  }

  // Get account will return data with carrierId and roles
  async function getAccount(req, res, next) {
    try {
      const user = await iamServiceClient.getUser(req.params);
      const userInfo = formatAccountResult(user);
      // get the carrier
      userInfo.carrierId = await provisionHelper.getCarrierIdByCompanyId(user.affiliatedCompany);
      const roles = await iamServiceClient.getUserRoles({ userId: user.id });
      userInfo.roles = _.map(roles, role => ({ company: role.company, id: role.id }));
      res.json(userInfo);
    } catch (ex) {
      next(ex);
    }
  }

  // update Account result will return data with carrierId without roles
  async function updateAccount(req, res, next) {
    debug('update account via account controller');
    try {
      const command = _.omit(_.extend({}, formatAccountData(req.body), { id: req.params.id }), 'roles');
      await iamServiceClient.putUser(command);
      // add the roles
      if (req.body.roles) {
        await iamServiceClient.setUserRoles({ userId: command.id, roles: req.body.roles });
      }
      res.json(204);
    } catch (ex) {
      next(ex);
    }
  }

  async function deleteAccount(req, res, next) {
    debug('delete account via account controller');
    try {
      await iamServiceClient.deleteUser(req.params);
      res.json({ result: req.params.id });
    } catch (ex) {
      next(ex);
    }
  }

  return {
    getAccounts,
    getAccount,
    createAccount,
    deleteAccount,
    updateAccount,
    requestSetPassword,
  };
}
