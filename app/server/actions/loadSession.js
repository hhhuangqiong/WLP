import createDebug from 'debug';
import Q from 'q';

const debug = createDebug('app:actions/loadSession');

export default function loadSession(context, payload) {
  const { apiClient } = context;
  const { carrierId } = payload;
  if (!carrierId) {
    context.dispatch('LOAD_SESSION', null);
    return Q.resolve(null);
  }
  debug(`Loading current user info for carrier: ${carrierId}`);
  return apiClient
    .get(`/carriers/${carrierId}/me`)
    .then(user => {
      debug(`Loaded user successfully: ${user.username}.`);
      context.dispatch('LOAD_SESSION', user);
      return user;
    })
    .catch(err => {
      debug(`Error while loading current user: ${err.message}.`);
      context.dispatch('LOAD_SESSION', null);
    });
}
