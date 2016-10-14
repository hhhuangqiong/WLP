import {
  createAuthorizationMiddlewareFactory,
} from './authorization';
import createSessionMiddleware from './session';
import noCache from './noCache';
import { apiErrorHandler } from './errorHandler';
import { authenticationMiddleware } from './authentication';
import ensureAuthenticatedMiddleware from './ensureAuthenticated';

function register(container) {
  container.service('SessionMiddleware', createSessionMiddleware, 'SessionMiddlewareOptions');
  container.service('AuthorizationMiddlewareFactory', createAuthorizationMiddlewareFactory, 'logger', 'AclResolver');
  container.constant('NoCacheMiddleware', noCache);
  container.constant('ApiErrorHandlerMiddleware', apiErrorHandler);
  container.constant('AuthenticationMiddleware', authenticationMiddleware);
  container.constant('EnsureAuthenticatedMiddleware', ensureAuthenticatedMiddleware);
}

export {
  createAuthorizationMiddlewareFactory,
  createSessionMiddleware,
  noCache,
  apiErrorHandler,
  authenticationMiddleware,
  ensureAuthenticatedMiddleware,

  register,
};
