export default function (context, param, done) {
  context.dispatch('REDIRECTED_TO_ACCOUNT_HOME');
  done();
}
