var Immutable = require('immutable');

var db = {};

db._state = Immutable.fromJS({
  sessions: {},
  contacts: {}  //keep here for demonstration way of exposing other data
});

db.createSession = function(token) {
  this._state = this._state.setIn(['sessions', token], true);
  return token;
};

db.checkSession = function(token) {
  return this._state.getIn(['sessions', token], false);
};

db.revokeSession = function(token) {
  if (!this._state.getIn(['sessions', token])) {
    return null;
  }
  this._state = this._state.removeIn(['sessions', token]);
  return true;
};

module.exports = db;

