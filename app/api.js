var superagent = require('superagent');
var debug = require('debug')('wlp:Api');

function Api(options) {
  options = options || {};
  var noop = function() {};

  this._getHost = options.getHost || noop;
  this._getToken = options.getToken || noop;
  this._getUserId = options.getUserId || noop;
}

Api.prototype.signIn = function(username, password, cb) {
  superagent
    .post(this._getHost() + '/sign-in')
    .accept('json')
    .send({
      username: username,
      password: password
    })
    .end(function(err, res) {
      if (err) {
        debug('error', err);
      }
      if (!res.ok) {
        err = (res.body && res.body.error) || {
          status: res.status
        };
      }

      cb(err, res && res.body);
    });
};

Api.prototype.signOut = function(cb) {
  superagent
    .post(this._getHost() + '/sign-out')
    .accept('json')
    .set('Authorization', this._getToken())
    .end(function(err, res) {
      if (err) {
        debug('error', err);
      }
      cb(err, res && res.body);
    });
};

Api.prototype.getSession = function(token, cb) {
  superagent
    .get(this._getHost() + '/session')
    .accept('json')
    .set('Authorization', token)
    .end(function(err, res) {
      if (err) {
        debug('error', err);
      }
      token = res && res.ok ? token : null;
      cb(err, token);
    });
};

Api.prototype.getManagingCompanies = function(params, cb) {
  superagent
    .get(`${this._getHost()}/switcher/companies`)
    .accept('json')
    .set('Authorization', this._getToken())
    .query({
      userId: this._getUserId()
    })
    .end(function(err, res) {
      if (err) {
        debug('error', err);
      }

      cb(err, res && res.body);
    });
};

Api.prototype.getCompanies = function(params, cb) {
  superagent
    .get(`${this._getHost()}/companies`)
    .accept('json')
    .set('Authorization', this._getToken())
    .query({
      userId: this._getUserId()
    })
    .end(function(err, res) {
      if (err) {
        debug('error', err);
      }

      cb(err, res && res.body);
    });
};

Api.prototype.createCompany = function(params, cb) {
  superagent
    .post(`${this._getHost()}/companies`)
    .accept('json')
    .set('Authorization', this._getToken())
    .send(params.data)
    .end(function(err, res) {
      if (err) {
        debug('error', err);
      }

      cb(err, res && res.body);
    });
};

Api.prototype.getApplication = function(params, cb) {
  superagent
    .get(`${this._getHost()}/companies/${params.carrierId}/applications`)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(function(err, res) {
      if (err) {
        debug('error', err);
      }

      cb(err, res && res.body);
    })
};

Api.prototype.updateCompany = function(params, cb) {
  superagent
    .put(`${this._getHost()}/companies/${params.carrierId}/${params.subPage}`)
    .accept('json')
    .set('Authorization', this._getToken())
    .send(params.data)
    .end(function(err, res) {
      if (err) {
        debug('error', err);
      }

      cb(err, res && res.body);
    });
};

Api.prototype.getEndUsers = function(params, cb) {
  superagent
    .get(`${this._getHost()}/carriers/${params.carrierId}/users`)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(function (err, res) {
      if (err) {
        debug('error', err);
      }
      cb(err, res && res.body);
    });
};

Api.prototype.getEndUser = function(params, cb) {
  superagent
    .get(`${this._getHost()}/carriers/${params.carrierId}/users/${params.username}`)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(function (err, res) {
      if (err) {
        debug('error', err)
      }
      cb(err, res && res.body);
    });
};

Api.prototype.getCalls = function(params, cb) {
  console.log('Authorization token',this._getToken());
  console.log(this._getHost()+'/calls/carriers/'+params.carrierId);
  superagent
    .get(`${this._getHost()}/calls/carriers/${params.carrierId}`)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(function (err, res) {
      if (err) {
        debug('error', err);
      }
      cb(err, res && res.body);
    });
};

module.exports = Api;
