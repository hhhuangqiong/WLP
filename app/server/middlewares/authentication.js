import { introspect } from '../openid/manager';

// Using the passportjs and openid, it will attach the access token in the req.user
// instrospect the token and log out user, it will then redirect to the login page.
export async function authentication(req, res, next) {
  const { user } = req;
  if (!user) {
    next();
    return;
  }
  // log out the user if missing token or invalid/inactive token
  if (user.tokens) {
    const token = await introspect(user.tokens.access_token);
    if (token.active) {
      next();
      return;
    }
  }
  req.logout();
  // it will redirect to the first page and obtain the token again(if session exist)
  // without redirect or reload, the current req.user won't clean up
  res.redirect('/');
}
