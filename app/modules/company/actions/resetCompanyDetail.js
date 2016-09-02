export default function (context, params, done) {
  context.dispatch('RESET_COMPANY_DETAIL');
  done();
}
