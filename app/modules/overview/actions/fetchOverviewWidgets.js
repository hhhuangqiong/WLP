let debug = require('debug')('src:modules/actions/fetchOverviewWidgets');

export default function fetchOverviewWidgets(context, params, done) {
  debug('Started');
  context.dispatch('FETCH_OVERVIEW_WIDGETS_START');
  context.api.getOverviewWidgets(params, function(err, result) {
    if (err) {
      debug('Failed');
      context.dispatch('FETCH_OVERVIEW_WIDGETS_FAILURE', err);
      done();
      return;
    }

    debug('Success');
    context.dispatch('FETCH_OVERVIEW_WIDGETS_SUCCESS', result);
    done();
  });
};
