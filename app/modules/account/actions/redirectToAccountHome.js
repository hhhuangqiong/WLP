export default function (context, param, done) {
  context.dispatch('REDIRECT_TO_ACCOUNT_HOME');
  done();
}
