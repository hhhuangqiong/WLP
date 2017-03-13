import dispatchApiCall from '../../../utils/dispatchApiCall';
import transformParameters from '../utils/transformParameters';

export default function (context, params) {
  const query = transformParameters(params);
  const { carrierId } = query;
  const args = {
    context,
    eventPrefix: 'FETCH_VERIFICATIONS',
    url: `/carriers/${carrierId}/verifications`,
    method: 'get',
    query,
  };
  dispatchApiCall(args);
}
