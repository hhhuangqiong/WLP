var debug = require('debug')('wlp:fetchEndUsers');

import request from 'superagent';

export function fetchEndUsers(context, { carrierId }, done) {
  request
    .get(`http://localhost:3000/api/1.0/carriers/${carrierId}/users`)
    .set('Accept', 'application/json')
    .end(function (err, res) {
      if (err) {
        done();
        return;
      }
      context.dispatch('LOAD_END_USERS', {
        users: res.body.userList
      });

      done();
    });
};

export function fetchEndUser(context, { carrierId, username }, done) {

  request
    .get(`http://localhost:3000/api/1.0/carriers/${carrierId}/users/${username}`)
    .set('Accept', 'application/json')
    .end(function(err, res){
      if (err) {
        done();
        return;
      }

      context.dispatch('LOAD_END_USER', {
        user: res.body
      });

      done();
    });
};
