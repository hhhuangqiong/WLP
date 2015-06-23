let Cookie = require('./Cookie');

module.exports = {
  name: 'CookiePlugin',

  plugContext: function(options) {
    // 1000 * 60 * 30 if and only if no COOKIE.MAX_AGE in app/config
    let maxAge = options.config && options.config.COOKIE.MAX_AGE || 1000 * 60 * 30;

    return {
      plugActionContext: function(actionContext) {
        actionContext.cookie = new Cookie({
          req: options.req,
          res: options.res,
          maxAge: maxAge
        });
      },

      dehydrate: function() {
        return {
          maxAge: maxAge
        };
      },

      rehydrate: function(state) {
        maxAge = state.maxAge;
      }
    }
  }
};
