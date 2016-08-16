import _ from 'lodash';
import moment from 'moment';
import { ArgumentError } from 'common-errors';
import nconf from 'nconf';

const debug = require('debug')('app:controllers/api');

function formatAccountData(account, isCreated) {
  if (!account.name) {
    return account;
  }

  const formattedAccount = _.omit(account, 'name');
  formattedAccount.name = {
    givenName: account.name.firstName,
    familyName: account.name.lastName,
  };
  if (isCreated) {
    formattedAccount.clientId = nconf.get('openid:clientId');
    formattedAccount.redirectURL = `${nconf.get('APP_URL')}/callback`;
  }
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
    isVerified: user.active,
    createdAt: moment(user.createdAt).format('LLL'),
    updatedAt: moment(user.updatedAt).format('LLL'),
  };
  return userInfo;
}

export default function accountController(iamServiceClient, mpsClient) {
  // get Accounts result will return simple data without carrierId and role
  async function getAccounts(req, res, next) {
    debug('get accounts via account controller');
    try {
      const command = req.query;
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
      const createUserdata = _.omit(formatAccountData(req.body, true), 'roles');
      const result = await iamServiceClient.createUser(createUserdata);
      debug('created and get back the user information', result);
      const user = await iamServiceClient.getUser({ id: result.id });
      const userInfo = formatAccountResult(user);
      // get the carrier
      userInfo.carrierId = await mpsClient.getCarrierIdByCompanyId(user.affiliatedCompany);
      // add the roles
      if (req.body.roles) {
        await iamServiceClient.setUserRoles({ userId: user.id, roles: req.body.roles });
      }
      res.json(userInfo);
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
      userInfo.carrierId = await mpsClient.getCarrierIdByCompanyId(user.affiliatedCompany);
      userInfo.roles = await iamServiceClient.getUserRoles({ userId: user.id });
      res.json(userInfo);
    } catch (ex) {
      next(ex);
    }
  }

  // update Account result will return data with carrierId without roles
  async function updateAccount(req, res, next) {
    debug('update account via account controller');
    try {
      // separate into a few request
      const command = _.omit(_.extend({}, req.body, req.params), 'roles', 'removeRoles');
      await iamServiceClient.putUser(command);
      const user = await iamServiceClient.getUser({ id: command.id });
      const userInfo = formatAccountResult(user);
      // get the carrier
      userInfo.carrierId = await mpsClient.getCarrierIdByCompanyId(user.affiliatedCompany);
      // @TODO plan to update by 1 request
      if (command.roles && command.roles.length > 0) {
        await iamServiceClient.setUserRoles({ userId: user.id, roles: command.roles });
      }
      if (command.removeRoles && command.removeRoles.length > 0) {
        await iamServiceClient.deleteUserRoles({ userId: user.id, roles: command.removeRoles });
      }
      res.json(userInfo);
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

  async function getAccessibleCompanies(req, res, next) {
    debug('get user managing companies via account controller');
    const { user } = req;
    if (!user) {
      debug('user is not logged in and fail to get managing companies');
      res.json([]);
      return;
    }

    const affiliatedCompany = _.get(req, 'user.affiliatedCompany');
    debug('get the affiliatedCompany', affiliatedCompany);
    if (!affiliatedCompany) {
      debug('user is logged in and without the current affiliated company');
      res.apiError(500, {
        errors: new ArgumentError('req.user.affiliatedCompany'),
      });
      return;
    }

    try {
      // Ensure the existence of affiliated company
      const company = await iamServiceClient.getCompany({ id: affiliatedCompany });
      // find all the companies that under affiliated company
      // @TODO pagination handling for pageSize, expect to get all companies
      const result = await iamServiceClient.getCompanies({ parent: company.id, pageSize: 200 });
      for (const mCompany of result.items) {
        mCompany.carrierId = await mpsClient.getCarrierIdByCompanyId(mCompany.id);
      }
      // including itself
      res.json(result.items);
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
    getAccessibleCompanies,
  };
}
