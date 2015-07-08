var debug = require('debug')('wlp:fetchExport');

export default function(context, params, done) {
  debug('Started');

  context.dispatch('FETCH_EXPORT_START');

  context.api.getCallsExport(params, function(err, result) {
    context.dispatch('FETCH_EXPORT_END');
    if (err) {
      debug('Failed');
      context.dispatch('FETCH_EXPORT_FAILURE', err);
      done();
      return;
    }

    debug('Success');
    context.dispatch('FETCH_EXPORT_SUCCESS', result);
    done();
  });

};
