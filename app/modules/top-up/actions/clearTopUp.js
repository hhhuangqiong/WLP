export default function clearTopUp(context, params, done) {
  context.dispatch('CLEAR_TOP_UP');
  done();
}
