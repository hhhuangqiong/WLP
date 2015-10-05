export default function(context, modal, done) {
  context.dispatch('MODAL_CONTENT_CHANGE', modal);
  done();
}
