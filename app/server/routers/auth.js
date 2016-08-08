import { Router } from 'express';
import passport from 'passport';

import * as auth from '../routes/auth';
import { SIGN_IN, SIGN_OUT } from '../../utils/paths';

export const router = new Router();
router.get(SIGN_IN, auth.signIn);
router.get(SIGN_OUT, auth.signOut);
router.get('/callback', passport.authenticate('openid-connect', {
  failureRedirect: SIGN_IN, successReturnToOrRedirect: '/' }));
export default router;
