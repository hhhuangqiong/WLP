var superagent = require('superagent');
var debug = require('debug')('app:Api');

function Api(options = {}) {
  var noop = Function.prototype;

  this._getHost   = options.getHost || noop;
  this._getToken  = options.getToken || noop;
  this._getUserId = options.getUserId || noop;
}

Api.prototype.signIn = function(username, password, cb) {
  superagent
    .post(`${this._getHost()}/api/sign-in`)
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
    .post(`${this._getHost()}/api/sign-out`)
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
    .get(`${this._getHost()}/api/session`)
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
    .get(`${this._getHost()}/api/switcher/companies`)
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
    .get(`${this._getHost()}/api/companies`)
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
    .post(`${this._getHost()}/api/companies`)
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

Api.prototype.getCompanyService = function(params, cb) {
  superagent
    .get(`${this._getHost()}/api/companies/${params.carrierId}/service`)
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
    })
};

Api.prototype.getApplications = function(params, cb) {
  superagent
    .get(`${this._getHost()}/api/companies/${params.carrierId}/applications`)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(function(err, res) {
      if (err) {
        debug('error', err);
      }

      cb(err, res && res.body);
    })
};

Api.prototype.updateCompanyProfile = function(params, cb) {
  superagent
    .put(`${this._getHost()}/api/companies/${params.carrierId}/profile`)
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

Api.prototype.updateCompanyService = function(params, cb) {
  superagent
    .put(`${this._getHost()}/api/companies/${params.carrierId}/service`)
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

Api.prototype.updateCompanyWidget = function(params, cb) {
  superagent
    .put(`${this._getHost()}/api/companies/${params.carrierId}/widget`)
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
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/users`)
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
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/users/${params.username}`)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(function (err, res) {
      if (err) {
        debug('error', err)
      }
      cb(err, res && res.body);
    });
};

Api.prototype.getSMS = function(params, cb) {
  superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/sms`)
    .query(params)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(function (err, res) {
      if (err) {
        debug('error', err)
      }
      cb(err, res && res.body);
    });
};

Api.prototype.getSMSWidgets = function(params, cb) {
  superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/widgets/sms`)
    .accept('json')
    .set('Authorization', this._getToken())
    .query({
      userId: this._getUserId()
    })
    .end(function (err, res) {
      if (err) {
        debug('error', err)
      }
      cb(err, res && res.body);
    });
};

Api.prototype.getCalls = function(params, cb) {
  superagent
    .get(`${this._getHost()}/api/calls/carriers/${params.carrierId}`)
    .query(params)
    .accept('json')
    .set('Authorization', this._getToken())
    .end(function (err, res) {
      if (err) {
        debug('error', err);
      }
      cb(err, res && res.body);
    });
};

Api.prototype.getTopUpHistory = function(params, cb) {
  superagent
    .get(`${this._getHost()}/api/carriers/${params.carrierId}/topup`)
    .query(params)
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
