import _ from 'lodash';
import moment from 'moment';
import { inputDateFormat as DATE_FORMAT } from '../../../main/config';
/**
 * Transforms the parameters from UI-specific to API-specific.
 *
 * @method
 * @param {Object} params  The UI-specific parameters
 * @returns {Object} The API-specific parameters
 */
function transformParameters(params) {
  // transform the params from UI-specific to API-specific
  const size = params.pageSize;
  const page = params.page || 0;
  const carrierId = params.carrierId;
  const application = params.appId;
  // "2014-09-08T08:02:17-05:00" (ISO 8601)
  const from = moment(params.startDate, DATE_FORMAT).startOf('day').format();
  const to = moment(params.endDate, DATE_FORMAT).endOf('day').format();
  const method = params.method;
  const platform = params.os;
  const phone_number = params.number && (`*${params.number}*`);

  // only send the query which has been set by the client
  const query = _.omit({
    size,
    page,
    application,
    from,
    to,
    carrierId,
    method,
    phone_number,
    platform,
  }, value => !value);

  return query;
}

export default transformParameters;
