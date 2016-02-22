export default function clearSMS(context, params, done) {
  context.dispatch('CLEAR_SMS');
  done();
}
