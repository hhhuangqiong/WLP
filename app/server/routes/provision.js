import { fetchDep } from '../utils/bottle';
import nconf from 'nconf';

const provisionController = fetchDep(nconf.get('containerName'), 'ProvisionController');

const createProvision = (req, res, next) => (
  provisionController.createProvision(req, res, next)
);

const getProvision = (req, res, next) => (
  provisionController.getProvision(req, res, next)
);

const getProvisions = (req, res, next) => (
  provisionController.getProvisions(req, res, next)
);

const putProvision = (req, res, next) => (
  provisionController.putProvision(req, res, next)
);

const getPreset = (req, res, next) => (
  provisionController.getPreset(req, res, next)
);

export {
  createProvision,
  getProvision,
  getProvisions,
  putProvision,
  getPreset,
};
