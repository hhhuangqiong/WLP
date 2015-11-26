
export default function(context, payload, done) {
  context.dispatch('UPDATE_END_USER_SELECTED_YEAR_SUCCESS', payload);
  done();
};
