import { Strategy } from 'passport-strategy';
import { ArgumentNullError } from 'common-errors';
import { loadClient, getAuthorizationUrl, getUserInfo, authorizationCallback } from './manager';
import { fetchDep } from '../utils/bottle';
import nconf from 'nconf';

export class OpenIdStrategy extends Strategy {
  constructor(options = {}, verify) {
    super(options, verify);
    this.name = 'openid-connect';
    // validate the required fields
    if (!options.clientId) {
      throw new ArgumentNullError('clientId');
    }
    if (!options.clientSecret) {
      throw new ArgumentNullError('clientSecret');
    }
    if (!options.issuer) {
      throw new ArgumentNullError('issuer');
    }
    this._config = {
      scope: options.scope || 'openid',
      skipUserInfo: options.skipUserProfile || false,
      ...options,
    };
    this._verify = verify;
    loadClient(this._config);
  }

  authenticate(req) {
    const options = this._config;
    if (req.query && req.query.error) {
      this.fail();
      return;
    }
    // token end point
    if (req.query && req.query.code) {
      authorizationCallback(req.query)
        .then(tokens => {
          const verified = (error, user, info) => {
            if (error) {
              return this.error(error);
            }
            if (!user) {
              return this.fail(info);
            }
            return this.success(user, info);
          };
          if (options.skipUserInfo) {
            return this._verify(tokens, verified);
          }
          // get user info
          return getUserInfo(tokens)
            .then(userInfo => {
              // fetch the user info via identity
              const iamClient = fetchDep(nconf.get('containerName'), 'IamServiceClient');
              const provisionHelper = fetchDep(nconf.get('containerName'), 'ProvisionHelper');
              return iamClient.getUser({ id: userInfo.sub }).then(user =>
                provisionHelper.getCarrierIdByCompanyId(user.affiliatedCompany)
                  .then(carrierId => {
                    const mUser = user;
                    mUser.carrierId = carrierId;
                    return mUser;
                  })).then(user => {
                    this._verify(tokens, user, verified);
                  });
            });
        }).catch(ex => {
          this.error(ex);
        });
    } else {
      // redirect to the SSO page and ask user to login
      getAuthorizationUrl().then(authURL => {
        this.redirect(authURL);
      });
    }
  }
}
