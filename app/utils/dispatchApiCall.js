import _ from 'lodash';
const EVENT_KEYS = ['START', 'END', 'SUCCESS', 'FAILURE'];

async function dispatchApiCall({ context, eventPrefix, url, method, data, query, token, prefix }) {
  const lifecycle = {};

  EVENT_KEYS.forEach((event) => {
    lifecycle[event] = `${eventPrefix.toUpperCase()}_${event}`;
  });

  context.dispatch(lifecycle.START);

  try {
    const res = await context.apiClient[method](url, { data, query }, prefix);
    context.dispatch(lifecycle.END);
    if (_.isArray(res)) {
      context.dispatch(lifecycle.SUCCESS, res, token);
    } else {
      context.dispatch(lifecycle.SUCCESS, { token, ...res });
    }
    return res;
  } catch (err) {
    context.dispatch(lifecycle.END);
    context.dispatch(lifecycle.FAILURE, err);
    throw err;
  }
}

export default dispatchApiCall;
