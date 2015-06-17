var debug = require('debug')('app:fetchEndUsers');

export default function(context, { routeName, params, query }, done) {
  context.dispatch('CLEAR_END_USERS_SUCCESS');

  context.getRouter().transitionTo(routeName, params, _.omit(query, function(value) {
    return !value;
  }));
};
