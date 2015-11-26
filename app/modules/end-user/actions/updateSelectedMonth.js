
export default function(context, payload, done) {
  context.dispatch('UPDATE_END_USER_SELECTED_MONTH_SUCCESS', payload);
  done();
};
