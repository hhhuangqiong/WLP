import { CLEAR_IM_STORE } from '../constants/actionTypes';

export default function clearTopUp(context, params, done) {
  context.dispatch(CLEAR_IM_STORE);
  done();
}
