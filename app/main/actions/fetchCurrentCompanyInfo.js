import { resolveCarrierId } from '../../utils/fluxible';

const debug = require('debug')('app:actions/fetchCurrentCompanyInfo');

export default function (context, payload, done) {
  const carrierId = resolveCarrierId(payload);
  // no carrier Id at the beginning(root domain),
  // it will redirect to the correct route and check again later
  if (!carrierId) {
    context.dispatch('FETCH_COMPANY_INFO_FAILURE');
    done();
    return;
  }
  debug(`Started fetch company info, carrier id: ${carrierId}.`);
  context.dispatch('FETCH_COMPANY_INFO_START');
  context.api.getCurrentCompanyInfo({ carrierId }, (err, company) => {
    if (err) {
      debug('Failed to fetch company info');
      context.dispatch('FETCH_COMPANY_INFO_FAILURE', err);
      done();
      return;
    }
    debug('Success get company info');
    context.dispatch('FETCH_COMPANY_INFO_SUCCESS', company);
    done();
  });
}
