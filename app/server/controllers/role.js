import { extend } from 'lodash';
import invariant from 'invariant';

// TODO: Consider simple proxying to another microservice using something like
// https://github.com/chimurai/http-proxy-middleware or custom middleware
// So WLP just becomes a dumb API gateway, not a wrapper with repetitive code

export default function roleController(iamServiceClient) {
  invariant(iamServiceClient, 'IamServiceClient is required for role controller');

  async function list(req, res, next) {
    try {
      const roles = await iamServiceClient.getRoles(req.query);
      res.json(roles);
    } catch (e) {
      next(e);
    }
  }
  async function create(req, res, next) {
    try {
      const role = await iamServiceClient.createRole(req.body);
      res.json(role);
    } catch (e) {
      next(e);
    }
  }
  async function update(req, res, next) {
    try {
      const command = extend({}, req.body, req.params);
      const result = await iamServiceClient.updateRole(command);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }
  async function remove(req, res, next) {
    try {
      const command = req.params;
      await iamServiceClient.deleteRole(command);
      // return result with id to adapt API action creator
      res.json({ id: command.id });
    } catch (e) {
      next(e);
    }
  }

  return {
    list,
    create,
    update,
    remove,
  };
}
