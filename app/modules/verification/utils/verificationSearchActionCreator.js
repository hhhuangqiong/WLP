import _ from 'lodash';
import moment from 'moment';

import actionCreator from '../../../main/utils/apiActionCreator';
import { ERROR_MESSAGE } from '../../../main/constants/actionTypes';
import config from '../../../config';

let { inputDateFormat: DATE_FORMAT } = require('./../../../main/config');

const EVENT_KEYS = ['SUCCESS', 'FAILURE'];

/**
 * Concatenates 2 input strings with a `_`, making the first input as the prefix of the second.
 *
 * @method
 * @param {String} prefix  The string to be a prefix
 * @param {String} str  The string to be prefixed
 * @returns {String} The prefixed string
 */
function prefix_(prefix, str) {
  return `${prefix.toUpperCase()}_${str}`;
}

/**
 * Creates and returns a callback function for the apiCreator.
 *
 * The callback function will handle the result transformation
 * and dispatch the correct event with respect to the lifecycle.
 *
 * @method
 * @param {String} actionName  The action name for event dispatch purpose
 * @param {Object} context  The execution context
 * @returns {Function} The node-style callback function
 */
function createVerificationSearchApiCallback(actionName, context) {
  // prepare the lifecycle messages
  let transform = _.partial(prefix_, actionName);
  let lifecycle = EVENT_KEYS.reduce((obj, value) => {
    obj[value] = transform(value);
    return obj;
  }, {});

  let debug = require('debug')(`app:${actionName}`);

  return function(err, response) {
    if (err) {
      debug(`Failed: ${err.message}`);
      context.dispatch(lifecycle.FAILURE, err);
      context.dispatch(ERROR_MESSAGE, err);
      return;
    }

    // transform the result from API-specific to UI-specific
    let result = {
      items: response.content,
      count: response.total_elements,
      page: response.page_number,
      pageSize: response.page_size
    };

    debug('Success');
    context.dispatch(lifecycle.SUCCESS, result);
  };
}

/**
 * Transforms the parameters from UI-specific to API-specific.
 *
 * @method
 * @param {Object} params  The UI-specific parameters
 * @returns {Object} The API-specific parameters
 */
function transformParameters(params) {
  // transform the params from UI-specific to API-specific
  let size = params.pageSize || config.PAGES.VERIFICATIONS.PAGE_SIZE;
  let page = params.page || 0;
  let carrierId = params.carrierId;
  let application = params.appId;
  // "2014-09-08T08:02:17-05:00" (ISO 8601)
  let from = moment(params.startDate, DATE_FORMAT).startOf('day').format();
  let to = moment(params.endDate, DATE_FORMAT).endOf('day').format();
  let method = params.method;
  let platform = params.os;
  let phone_number = params.number && (`*${params.number}*`);

  // only send the query which has been set by the client
  let query = _.omit({
    size,
    page,
    application,
    from,
    to,
    carrierId,
    method,
    phone_number,
    platform
  }, function(value) {
    return !value;
  });

  return query;
}

export default function(actionName, apiMethod) {
  return function(context, params, done) {
    // create the API function object, pass in the custom callback
    let api = actionCreator(actionName, apiMethod, {
      cb: createVerificationSearchApiCallback(actionName, context)
    });

    // invoke the API
    api(context, transformParameters(params), done);
  };
}
