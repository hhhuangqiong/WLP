import { omit } from 'lodash';
import dispatchApiCall from '../../../utils/dispatchApiCall';

export default function (context, params) {
  const { carrierId, id, ...data } = params;

  const args = {
    context,
    eventPrefix: 'UPDATE_ROLE',
    url: `/carriers/${carrierId}/roles/${id}`,
    method: 'put',
    data: omit(data, ['createdAt', 'updatedAt', 'isRoot']),
  };
  dispatchApiCall(args);
}
