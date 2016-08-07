import { SIGN_OUT } from '../../utils/paths';

export default function (context, payload, done) {
  context.dispatch('SIGN_OUT');
  // it will go to /sign-out which will construct the url to end IAM session,
  // then it will redirect to that url, redirect back to the postLogoutURL set when loading
  // the passport strategy which is the first page where will later redirect by the standard
  // login flow and enter the sign in page
  window.location.assign(SIGN_OUT);
  done();
}
