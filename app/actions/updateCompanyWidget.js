var debug = require('debug')('wlp:updateCompanyWidget');

export default function(context, params, done) {
  debug('Started');
  context.dispatch(`UPDATE_COMPANY_WIDGET_START`);
  context.api.updateCompanyWidget(params, function(err, result) {
    if (err) {
      debug('Failed');
      context.dispatch(`UPDATE_COMPANY_WIDGET_FAILURE`, err);
      done();
      return;
    }

    debug('Success');
    context.dispatch(`UPDATE_COMPANY_WIDGET_SUCCESS`, result.company);
    done();
  });
};
