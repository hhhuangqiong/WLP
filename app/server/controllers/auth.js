import passport from 'passport';
import { signOut as openidSignOut } from '../openid/manager';

export default function authController() {
  const signIn = passport.authenticate('openid-connect');
  const signOut = openidSignOut;
  return {
    signIn,
    signOut,
  };
}
