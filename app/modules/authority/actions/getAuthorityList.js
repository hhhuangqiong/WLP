import { get } from 'lodash';
import { resolveCarrierId } from '../../../utils/fluxible';
import {
  GET_AUTHORITY_START,
  GET_AUTHORITY_SUCCESS,
  GET_AUTHORITY_FAILURE,
} from '../constants/actionTypes';
import { ERROR_MESSAGE } from '../../../main/system-message/constants/actionTypes';
const debug = require('debug')('app:modules/authority/actions/getAuthorityList');

export default function (context, payload, cb) {
  const { apiClient } = context;
  let carrierId = resolveCarrierId(payload);

  if (!carrierId) {
    debug('carrierId data cannot be found in url, returns to user session');
    carrierId = get(payload, 'req.user.affiliatedCompany.carrierId');
  }

  // if carrierId does not exists
  if (!carrierId) {
    debug('carrierId is missing, skip acquiring authority');
    cb();
    return;
  }

  context.dispatch(GET_AUTHORITY_START);

  apiClient
    .get(`/carriers/${carrierId}/authority`)
    .then(result => {
      const { status, errors } = result;

      // not confirmed how to handle
      // error localisation properly yet
      if (errors) {
        let errorId;

        switch (status) {
          case '401':
            errorId = 'authority.error.unauthorized';
            break;

          case '404':
            errorId = 'authority.error.notFound';
            break;

          case '500':
            errorId = 'authority.error.internalServerError';
            break;

          default:
            errorId = 'authority.error.general';
        }

        const error = {
          id: errorId,
        };

        context.dispatch(GET_AUTHORITY_FAILURE);
        context.dispatch(ERROR_MESSAGE, error);
        cb(error);
        return;
      }

      const authorities = get(result, 'data.attributes.authorities');
      debug('acquired authority list for carrier %s', carrierId, authorities);
      context.dispatch(GET_AUTHORITY_SUCCESS, authorities);
      cb(null, authorities);
    })
    .catch(err => {
      debug('error occurred when acquiring authority', err);
      context.dispatch(GET_AUTHORITY_FAILURE);
      cb(err);
    });
}
