'use strict';

var Api = require('../Api');
var AuthStore = require('../stores/AuthStore');
var env = require('./env');
var url = require('./url');
var sessionDebug = require('debug')('app:sessionFlow');

module.exports = {
  name: 'ApiPlugin',

  plugContext: function(options) {
    return {
      plugActionContext: function(actionContext) {
        actionContext.api = new Api({
          getHost: function() {
            try {
              if (env.CLIENT) {
                //use root path
                return '';
              } else {
                sessionDebug('SERVER ', url.baseUrl(process.env.APP_PORT, '127.0.0.1'));
                return url.baseUrl(process.env.APP_PORT, '127.0.0.1');
              }
            } catch (err) {
              sessionDebug(err);
            }
          },

          getToken: function() {
            return actionContext.getStore(AuthStore).getToken();
          },

          getUserId: function() {
            return actionContext.getStore(AuthStore).getUserId();
          }
        });
      }
    };
  }
};

