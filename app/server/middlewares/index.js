import {
  createAuthorizationMiddlewareFactory,
} from './authorization';
import createSessionMiddleware from './session';
import noCache from './noCache';
import { apiErrorHandler } from './errorHandler';

function register(container) {
  container.service('SessionMiddleware', createSessionMiddleware, 'SessionMiddlewareOptions');
  container.service('AuthorizationMiddlewareFactory', createAuthorizationMiddlewareFactory, 'logger', 'AclResolver');
  container.constant('NoCacheMiddleware', noCache);
  container.constant('ApiErrorHandlerMiddleware', apiErrorHandler);
}

export {
  createAuthorizationMiddlewareFactory,
  createSessionMiddleware,
  noCache,
  apiErrorHandler,

  register,
};
