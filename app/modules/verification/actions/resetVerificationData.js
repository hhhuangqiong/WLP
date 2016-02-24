export default function (context, params, done) {
  context.dispatch('RESET_VERIFICATION_DATA');
  done();
}
