import { omit } from 'lodash';
import actionCreator from '../../../main/utils/apiActionCreator';
const action = actionCreator('UPDATE_ROLE', 'updateRole');
export default function updateRole(context, payload, done) {
  return action(context, omit(payload, ['createdAt', 'updatedAt']), done);
}
