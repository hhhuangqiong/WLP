var debug = require('debug')('wlp:refreshCompany');

export default function(context, params, done) {
  debug('Started');
  context.dispatch('REFRESH_COMPANY_SUCCESS');
  context.getRouter().replaceWith(params.path);
  done();
};
