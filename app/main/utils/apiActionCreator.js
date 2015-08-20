/**
 * Use this helper object when you:
 *
 * - are going to pass the whole payload as the only (besides the action type) parameter to `context.dispatch()`
 * - do not care about the logic in the callback
 * - think generic error handling is enough
 */
import _ from 'lodash';

import { ERROR_MESSAGE } from '../../main/constants/actionTypes';

const EVENT_KEYS = ['START', 'END', 'SUCCESS', 'FAILURE'];

function prefix_(prefix, str) {
  return `${prefix.toUpperCase()}_${str}`;
}

/**
 * Create Fluxible action to work with the api object
 *
 * @param {string} key main event identifier
 * @param {string} apiMethod name of the method
 * @param {Object} opts options
 * @param {String} [opts.debugPrefix='app'] prefix to be used for 'debug'
 * @param {Function} [opts.cb] Custom callback for the API function, function(err, result) {}
 * @return {Function}
 *
 * @example
 * import actionCreator from 'path/to/apiActionCreator';
 *
 * export default actionCreator('FETCH_DATA', 'getCallsExportProgress');
 * // or
 * export default actionCreator('FETCH_DATA', 'getCallsExportProgress', function(err, result) { ... });
 */
export default function apiActionCreator(key, apiMethod, opts = { debugPrefix: 'app' }) {
  var transform = prefix_.bind(null, key);

  var lifecycle = EVENT_KEYS.reduce((o, k) => {
    o[k] = transform(k);
    return o;
  }, {});

  var debug = require('debug')(`${opts.debugPrefix}:${key}`);

  return function(context, params, done) {
    debug('Started');

    context.dispatch(lifecycle.START);

    if (opts.cb) {
      if (!_.isFunction(opts.cb)) {
        throw new Error('`cb` must be a function');
      }

      context.api[apiMethod](params, cb);
    } else {
      // default: return the *whole* result to `dispatch()`
      context.api[apiMethod](params, function(err, result) {
        context.dispatch(lifecycle.END);

        if (err) {
          debug('Failed');
          context.dispatch(lifecycle.FAILURE, err);

          // TODO conditionally called
          context.dispatch(ERROR_MESSAGE, err);

          done();
          return;
        }

        debug('Success');
        context.dispatch(lifecycle.SUCCESS, result);
        done();
      });
    }
  };
}

