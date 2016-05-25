import { isURL } from 'validator';
import { get, isUndefined } from 'lodash';
import {
  GET_AUTHORITY_START,
  GET_AUTHORITY_SUCCESS,
  GET_AUTHORITY_FAILURE,
} from '../constants/actionTypes';
import { ERROR_MESSAGE } from '../../../main/constants/actionTypes';
const debug = require('debug')('app:modules/authority/actions/getAuthorityList');

export default function (context, payload, cb) {
  const { apiClient } = context;
  const { params } = payload;

  let carrierId;

  if (!isUndefined(params)) {
    carrierId = params.identity;
  } else {
    const url = get(payload, 'req.url');
    carrierId = url.split('/')[2];
    carrierId = (carrierId === 'm800' ||
      isURL(carrierId, { allow_underscores: true })
    ) && carrierId || null;
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
