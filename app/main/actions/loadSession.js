let debug = require('debug');
debug = debug('app:actions/loadSession');

module.exports = (context, payload, done) => {
  debug('Started');

  const { apiClient } = context;

  apiClient
    .get('session')
    .then(result => {
      if (!result.data) {
        debug('empty session returned');
        context.dispatch('LOAD_SESSION', null);
        done();
        return;
      }

      debug(`data acquired from /session: ${result}`);
      const { id, attributes } = result.data;
      const user = {
        id,
        ...attributes,
      };

      context.dispatch('LOAD_SESSION', user);
      done(null, user);
    })
    .catch(err => {
      debug(err);
      context.dispatch('LOAD_SESSION', null);
      done(err);
    });
};
