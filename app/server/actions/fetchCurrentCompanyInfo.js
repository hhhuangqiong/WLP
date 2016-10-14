import nconf from 'nconf';
import { resolveCarrierId } from '../../utils/fluxible';
import { fetchDep } from '../../server/utils/bottle';

const debug = require('debug')('app:actions/fetchCurrentCompanyInfo');

export default function (context, payload, done) {
  const iamHelper = fetchDep(nconf.get('containerName'), 'IamHelper');
  const carrierId = resolveCarrierId(payload);
  // no carrier Id at the beginning(root domain),
  // it will redirect to the correct route and check again later
  if (!carrierId) {
    context.dispatch('FETCH_COMPANY_INFO_FAILURE');
    done();
    return;
  }

  iamHelper.getCompanyByCarrierId(carrierId).then(company => {
    debug('Success get company info');
    context.dispatch('FETCH_COMPANY_INFO_SUCCESS', company);
    done();
  }).catch(err => {
    context.dispatch('FETCH_COMPANY_INFO_FAILURE', err);
    done();
  });
}
