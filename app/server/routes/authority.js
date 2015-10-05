import _ from 'lodash';
import logger from 'winston';
import passport from 'passport';
import navSection from '../../main/constants/navSection';

import Authority from '../../main/authority';
import { getResources } from '../../main/authority/utils';
import sessionClient from '../initializers/sessionClient';

let sessionDebug = require('debug')('app:sessionFlow');

let getCapabilityList = function(req, res, next) {
  let token = req.header('Authorization');

  if (token == '__session__') {
    //from client
    token = req.sessionID;
  }

  if (!token) {
    logger.error('missing user session');
    res.status(404).send();
    return;
  }

  let resources = getResources();
  let carrierId = req.params.carrierId;
  let authority = new Authority(resources, { carrierId });

  return res.status(200).json({
    carrierId: carrierId,
    capability: authority.getCapabilities()
  });
};

export {
  getCapabilityList
};

