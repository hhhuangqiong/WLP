const debug = require('debug')('app:actions/loadSession');
const sessionDebug = require('debug')('app:sessionFlow');

module.exports = (context, payload, done) => {
  debug('Started');

  const token = context.cookie.get('token');
  sessionDebug('loadSession token:', token);
  const user = context.cookie.get('user');
  const username = context.cookie.get('username');
  const displayName = context.cookie.get('displayName');
  const carrierId = context.cookie.get('carrierId');
  const role = context.cookie.get('role');

  if (!token) {
    context.dispatch('LOAD_SESSION', null);
    done();
    return;
  }

  // shadow token in parameter
  context.api.getSession(token, (err, token) => {
    if (err) {
      debug('Failed');
      done(err);
      return;
    }

    // !IMPORTANT
    // blindly followed Nicolas Hery
    //
    // token is empty during server side rendering
    // wholly not understand why clear cookies while !token
    // clearing cookie DO NOT affect the login session at all
    // please inspire if you got the answer
    if (!token) {
      context.cookie.clear('token');
      context.cookie.clear('user');
      context.cookie.clear('carrierId');
      context.cookie.clear('role');
      done();
      return;
    }

    const session = {
      token,
      user: {
        _id: user,
        username,
        displayName,
        carrierId,
        role,
      },
    };

    debug('Success');
    context.dispatch('LOAD_SESSION', session);
    done(null, session);
  });
};
