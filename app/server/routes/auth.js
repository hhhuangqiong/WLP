import passport from 'passport';
import { signOut as openidSignOut } from '../openid/manager';

const signIn = passport.authenticate('openid-connect');
const signOut = openidSignOut;

export {
  signIn,
  signOut,
};
