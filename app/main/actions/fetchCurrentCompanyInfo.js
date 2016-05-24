import { resolveCarrierId } from '../../utils/fluxible';
const debug = require('debug')('app:actions/fetchCurrentCompanyInfo');

export default function (context, payload, done) {
  const carrierId = resolveCarrierId(payload);

  debug('Started');
  context.dispatch('FETCH_COMPANY_INFO_START');

  context.api.getCurrentCompanyInfo({ carrierId }, (err, result) => {
    if (err) {
      debug('Failed');
      context.dispatch('FETCH_COMPANY_INFO_FAILURE', err);
      done();
      return;
    }

    debug('Success');
    context.dispatch('FETCH_COMPANY_INFO_SUCCESS', result.company);
    done();
  });
}
