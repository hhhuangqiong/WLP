import {
  createFetchPermissionsMiddleware,
  createAuthorizationMiddleware,
} from './authorization';
import createSessionMiddleware from './session';
import noCache from './noCache';
import { apiErrorHandler } from './errorHandler';

function register(container) {
  container.service('FetchPermissionsMiddleware', createFetchPermissionsMiddleware, 'logger', 'AclResolver');
  container.service('SessionMiddleware', createSessionMiddleware, 'SessionMiddlewareOptions');
  container.constant('AuthorizationMiddlewareFactory', createAuthorizationMiddleware);
  container.constant('NoCacheMiddleware', noCache);
  container.constant('ApiErrorHandlerMiddleware', apiErrorHandler);
}

export {
  createFetchPermissionsMiddleware,
  createAuthorizationMiddleware,
  createSessionMiddleware,
  noCache,
  apiErrorHandler,

  register,
};
