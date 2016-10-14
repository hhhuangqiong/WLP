import Q from 'q';
import { merge } from 'lodash';

export default function meController(aclResolver, iamClient) {
  async function getCurrentUser(req, res, next) {
    try {
      const user = req.user;
      // return 404 if no user
      if (!user) {
        res.sendStatus(404);
        return;
      }

      const carrierId = req.params.carrierId;
      const [profile, permissionsAndCapabilities] = await Q.all([
        iamClient.getUser({ id: user.username }),
        aclResolver.resolve({
          username: user.username,
          carrierId,
        }),
      ]);
      const identity = merge({}, user, profile, permissionsAndCapabilities);
      res.json(identity);
    } catch (e) {
      next(e);
    }
  }

  return {
    getCurrentUser,
  };
}
