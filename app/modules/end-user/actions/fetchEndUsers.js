import _ from 'lodash';
import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const { carrierId, ...data } = params;
  const args = {
    context,
    eventPrefix: 'FETCH_END_USERS',
    url: `/carriers/${carrierId}/users`,
    method: 'get',
    query: _.pick(data, ['startDate', 'endDate', 'page', 'username']),
  };
  dispatchApiCall(args);
}
