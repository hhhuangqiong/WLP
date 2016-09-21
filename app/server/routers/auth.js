import { Router } from 'express';
import passport from 'passport';
import { SIGN_IN, SIGN_OUT } from '../../utils/paths';

export function createAuthRouter(authController) {
  const router = new Router();
  router.get(SIGN_IN, authController.signIn);
  router.get(SIGN_OUT, authController.signOut);
  router.get('/callback', passport.authenticate('openid-connect', {
    failureRedirect: SIGN_IN,
    successReturnToOrRedirect: '/',
  }));
  return router;
}

export default createAuthRouter;
