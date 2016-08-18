import _ from 'lodash';
let debug = require('debug');
debug = debug('app:actions/loadSession');

module.exports = (context, payload, done) => {
  debug('Started');
  // debug('payload req.user', payload.req.user);
  // const { apiClient } = context;

  // This is currently called from server side, so user will be already here
  const user = _.get(payload, 'req.user');
  context.dispatch('LOAD_SESSION', user);
  done(null, user);

  // Previous implementation, if you will want to rollback

  // apiClient
  //   .get('session')
  //   .then(result => {
  //     if (!result.data) {
  //       debug('empty session returned');
  //       context.dispatch('LOAD_SESSION', null);
  //       done();
  //       return;
  //     }
  //
  //     debug('data acquired from /session:', result);
  //     const { id, attributes } = result.data;
  //     const user = {
  //       id,
  //       ...attributes,
  //     };
  //
  //     context.dispatch('LOAD_SESSION', user);
  //     done(null, user);
  //   })
  //   .catch(err => {
  //     debug(err);
  //     context.dispatch('LOAD_SESSION', null);
  //     done(err);
  //   });
};
