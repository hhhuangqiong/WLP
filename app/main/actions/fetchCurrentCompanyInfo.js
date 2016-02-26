const debug = require('debug')('app:actions/fetchCurrentCompanyInfo');

export default function (context, params, done) {
  debug('Started');
  context.dispatch('FETCH_COMPANY_INFO_START');

  context.api.getCurrentCompanyInfo(params, (err, result) => {
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
