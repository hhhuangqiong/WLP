export default function clearVSFTransaction(context, params, done) {
  context.dispatch('CLEAR_VSF');
  done();
}
