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
      const command = _.omit(req.query, 'carrierId');
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
      userInfo.carrierId = await provisionHelper.getCarrierIdByCompanyId(user.affiliatedCompany);
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
      const command = _.omit(_.extend({}, formatAccountData(req.body), req.params), 'roles');
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
      const result = await iamServiceClient.getDescendantCompany({ id: company.id });
      // append the current company at the front
      result.unshift(company);
      const companyIds = _.map(result, item => item.id);
      const carrierIds = await provisionHelper.getCarrierIdsByCompanyIds(companyIds);
      const resultArray = [];
      _.forEach(result, (item, index) => {
        // only filter the companies with carrier Id
        if (carrierIds[index]) {
          const mItem = item;
          mItem.carrierId = carrierIds[index];
          resultArray.push(mItem);
        }
      });
      res.json(resultArray);
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
