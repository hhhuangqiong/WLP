export default function(context, params) {
  context.api.getAuthorityList(params.identity, (err, { carrierId, capability }) => {
    const authority = context.getAuthority();

    authority.reset(carrierId, capability);

    const defaultPath = authority.getDefaultPath();

    if (!defaultPath) return context.getRouter().transitionTo('/error/not-found');

    context.getRouter().transitionTo(defaultPath, { role: params.role, identity: params.identity });
  });
}
