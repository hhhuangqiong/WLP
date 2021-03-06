import _ from 'lodash';
import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const { carrierId } = params;
  const args = {
    context,
    eventPrefix: 'FETCH_END_USERS_REGISTRATION_STATS',
    url: `/carriers/${carrierId}/stat/user/query`,
    method: 'get',
    query: _.assign(params, { type: 'registration' }),
  };
  dispatchApiCall(args);
}
