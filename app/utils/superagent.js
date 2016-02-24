import _ from 'lodash';
import superagent from 'superagent';

const METHODS = ['get', 'post', 'put', 'delete', 'patch'];

METHODS.forEach(v => {
  const name = `${v}JsonSetup`;

  function _superagent(method, url) {
    return superagent[method](url);
  }

  /**
   * Prepare a superagent that accepts JSON
   *
   * @name: {get,post,put,delete,patch}JsonSetup
   *
   * @param {string} url URL with protocol
   * @param {Object} opts configuration
   * @return {Object} superagent instance
   */
  exports[name] = (url, opts = {}) => {
    const ret = _superagent(v, url).accept('json');

    const headers = opts.headers || {};

    for (let k in headers) {
      ret.set(k, _.result(headers, k));
    }

    return ret;
  };
});

/**
 * Provide a generic
 *
 * @param {Function} debugFn Function provided by "debug"
 * @return {Function}
 */
export function genericHandler(debugFn, cb) {
  if (!debugFn || !cb) throw new Error('`debugFn` & `cb` are required');

  return (err, res) => {
    let error;

    if (err) {
      debugFn('`err` happened', err);
      // default generic error message, not to be confused with 'Interal Server Error'
      error = new Error('Internal system error', err.stack);
    }

    if (!res.ok || (res.body && res.body.error)) {
      error = res.body.error || {
        // TODO should assign a default 'message' to the error object
        status: res.status,
      };
    }

    cb(error, res.body);
  };
}
