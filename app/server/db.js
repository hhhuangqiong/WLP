var Immutable = require('immutable');

const SESSION_KEY = 'sessions';

var db = {};

db._state = Immutable.fromJS({
  sessions: {}
});

db.createSession = function(token) {
  this._state = this._state.setIn([SESSION_KEY, token], true);
  return token;
};

db.checkSession = function(token) {
  return this._state.getIn([SESSION_KEY, token], false);
};

db.revokeSession = function(token) {
  if (!this._state.getIn([SESSION_KEY, token])) {
    return null;
  }

  this._state = this._state.removeIn([SESSION_KEY, token]);
  return true;
};

module.exports = db;

