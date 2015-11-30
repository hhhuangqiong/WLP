import logger from 'winston';

import Authority from '../../main/authority';
import { getResources } from '../../main/authority/utils';

const getCapabilityList = (req, res, next) => {
  let token = req.header('Authorization');

  if (token === '__session__') {
    // from client
    token = req.sessionID;
  }

  if (!token) {
    logger.error('missing user session');
    res.status(404).send();
    return;
  }

  const resources = getResources();
  const carrierId = req.params.carrierId;

  const authority = new Authority(resources, { carrierId });

  authority
    .getMenuItems()
    .then(menuItems => res.status(200).json({ carrierId, capability: menuItems }))
    .catch(err => next(err));
};


export { getCapabilityList };
