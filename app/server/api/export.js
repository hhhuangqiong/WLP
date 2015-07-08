var superagent = require('superagent');
var debug = require('debug')('wlp:Export');

export default function() {
  return {
    getCallsExport: function(params, cb) {
      superagent
        .get(`${this._getHost()}/export/${params.carrierId}/calls`)
        .query(params)
        .accept('json')
        .set('Authorization', this._getToken())
        .end(function(err, res) {
          if (err) {
            debug('error', err);
          }

          cb(err, res && res.body);
        });
    },

    getCallsExportProgress: function(params, cb) {
      //might need to check user authorization
      superagent
        .get(`${this._getHost()}/export/${params.carrierId}/calls/progress`)
        .query(params)
        .accept('json')
        .set('Authorization', this._getToken())
        .end(function(err, res) {
          if (err) {
            debug('error', err);
          }

          cb(err, res && res.body);
        });
    }
  };
}
