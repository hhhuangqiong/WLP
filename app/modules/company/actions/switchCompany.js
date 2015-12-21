import { userPath } from '../../../server/paths';

export default function(context, params) {
  context.api.getAuthorityList(params.identity, (err, { carrierId, capability }) => {
    const authority = context.getAuthority();

    authority.reset(carrierId, capability);

    const defaultPath = authority.getDefaultPath();

    if (!defaultPath) return context.getRouter().transitionTo('/error/not-found');

    context.getRouter().transitionTo(userPath(params.role, params.identity, defaultPath));
  });
}
