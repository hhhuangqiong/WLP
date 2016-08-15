export default function (context, params) {
  context.dispatch('REMOVE_ROLE_START');
  context.api.deleteRole(params, (err) => {
    if (err) {
      context.dispatch('REMOVE_ROLE_FAILURE', err);
      return;
    }
    context.dispatch('REMOVE_ROLE_SUCCESS', params);
  });
}
