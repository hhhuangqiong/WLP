import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const { carrierId } = params;
  const args = {
    context,
    eventPrefix: 'FETCH_PRESET',
    url: `/carriers/${carrierId}/preset`,
    method: 'get',
  };
  dispatchApiCall(args);
}
