let Cookie = require('./Cookie');

module.exports = {
  name: 'CookiePlugin',

  plugContext: function(options) {
    // 30 mins (30* 60) as default
    let maxAge = options.config && options.config.COOKIE.MAX_AGE || 60 * 30;

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
    };
  }
};
