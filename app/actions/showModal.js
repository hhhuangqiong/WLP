/**
 * Created by terryshek on 13/5/15.
 */
export default function(context, modal, done) {
  context.dispatch('MODAL_CONTENT_CHANGE', modal);
  done();
}
