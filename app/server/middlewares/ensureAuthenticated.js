import { extend } from 'lodash';
import { AuthenticationRequiredError } from 'common-errors';
// Using the passportjs and openid, it will attach the access token in the req.user
// check whether has user session here and throw 401 directly
export default function ensureAuthenticatedMiddleware(req, res, next) {
  if (!req.user) {
    const error = new AuthenticationRequiredError();
    extend(error, {
      message: 'Authentication is required to access the resource',
      status: 401,
    });
    next(error);
    return;
  }
  next();
}
