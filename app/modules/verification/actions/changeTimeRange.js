export default function (context, timeRange, done) {
  context.dispatch('CHANGE_TIME_RANGE', timeRange);
  done();
}
