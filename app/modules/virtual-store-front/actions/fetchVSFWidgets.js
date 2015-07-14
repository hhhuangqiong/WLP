const debug = require('debug')('src:modules/virtual-store-front/actions/fetchVSFWidgets');

export default function(context, params, done) {
  debug('fetch started');

  context.dispatch('FETCH_START');
  context.api.getfetchVSFWidgets(params, function(err, results) {
    // Notify spinner to quit
    context.dispatch('FETCH_END');

    if (err) {
      debug('Failed');
      context.dispatch('FETCH_VSF_WIDGETS_FAILURE', err);
      done();
      return;
    }

    debug('Success');
    context.dispatch('FETCH_VSF_WIDGETS_SUCCESS', results);
    done();
  });

};
