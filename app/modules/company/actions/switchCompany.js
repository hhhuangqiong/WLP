import { userPath } from '../../../utils/paths';

export default function (context, params) {
  context.api.getAuthorityList(params.identity, (err, { carrierId, capability }) => {
    const authority = context.getAuthority();

    authority.reset(carrierId, capability);

    const defaultPath = authority.getDefaultPath();

    if (!defaultPath) {
      context.router.push('/error/not-found');
      return;
    }

    context.router.push(userPath(params.identity, defaultPath));
  });
}
