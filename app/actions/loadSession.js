'use strict';
var debug = require('debug')('app:loadSession');

module.exports = function(context, payload, done) {
  debug('Started');
  let token = context.cookie.get('token');
  let user = context.cookie.get('user');
  let carrierId = context.cookie.get('carrierId');
  let urlPrefix = context.cookie.get('urlPrefix');
  if (!token) {
    context.dispatch('LOAD_SESSION', null);
    done();
    return;
  }
  // shadow token in parameter
  context.api.getSession(token, function(err, token) {
    if (err) {
      debug('Failed');
      done();
      return;
    }
    debug('Success');
    context.dispatch('LOAD_SESSION', {
      token: token,
      user: {
        _id: user,
        carrierId: carrierId,
        urlPrefix: urlPrefix
      }
    });
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
      context.cookie.clear('urlPrefix');
    }
    done();
  });
};