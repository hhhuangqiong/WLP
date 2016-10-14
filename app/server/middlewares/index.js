import {
  createAuthorizationMiddlewareFactory,
} from './authorization';
import createSessionMiddleware from './session';
import noCache from './noCache';
import { apiErrorHandler } from './errorHandler';
import { authentication } from './authentication';

function register(container) {
  container.service('SessionMiddleware', createSessionMiddleware, 'SessionMiddlewareOptions');
  container.service('AuthorizationMiddlewareFactory', createAuthorizationMiddlewareFactory, 'logger', 'AclResolver');
  container.constant('NoCacheMiddleware', noCache);
  container.constant('ApiErrorHandlerMiddleware', apiErrorHandler);
  container.constant('AuthenticationMiddleware', authentication);
}

export {
  createAuthorizationMiddlewareFactory,
  createSessionMiddleware,
  noCache,
  apiErrorHandler,
  authentication,
  register,
};
