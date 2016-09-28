import Q from 'q';
import { merge, extend } from 'lodash';
import { AuthenticationRequiredError } from 'common-errors';
// TODO: inject introspect into controller
import { introspect } from '../../server/openid/manager';

export default function meController(aclResolver, iamClient) {

  function createError() {
    const error = new AuthenticationRequiredError();
    // Need to do this as global error handler is not smart enough
    extend(error, { status: 401 });
    return error;
  }

  async function getCurrentUser(req, res, next) {
    try {
      const user = req.user;
      if (!user || !user.tokens) {
        req.logout();
        next(createError());
        return;
      }
      const token = await introspect(user.tokens.access_token);
      if (!token.active) {
        req.logout();
        next(createError());
        return;
      }
      const carrierId = req.params.carrierId;
      const [profile, permissionsAndCapabilities] = await Q.all([
        iamClient.getUser({ id: user.username }),
        aclResolver.resolve({
          username: user.username,
          carrierId,
        }),
      ]);
      const identity = merge({}, user, profile, permissionsAndCapabilities);
      res.json(identity);
    } catch (e) {
      next(e);
    }
  }

  return {
    getCurrentUser,
  };
}
