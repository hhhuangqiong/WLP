import logger from 'winston';
import passport from 'passport';
import resources from '../../main/authority/data/resource.json';

import Authority from '../../main/authority';
import sessionClient from '../initializers/sessionClient';

let sessionDebug = require('debug')('app:sessionFlow');

let getCapabilityList = function(req, res, next) {
  if (!resources)
    logger.info('missing resources config file');

  if (!req.user) {
    logger.error('missing user session');
    res.status(404);
    return;
  }

  let carrierId = req.user && req.user.affiliatedCompany.carrierId;
  let authority = new Authority(resources, { carrierId });

  return res.status(200).json({
    carrierId: carrierId,
    capability: authority.getCapabilities()
  });
};

export {
  getCapabilityList
};

