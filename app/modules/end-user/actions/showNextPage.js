export default function (context, params, done) {
  context.dispatch('SHOW_NEXT_PAGE');
  done();
}
