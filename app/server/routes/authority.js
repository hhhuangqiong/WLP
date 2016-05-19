import logger from 'winston';
import Authority from '../../modules/authority/manager';
import { getResources } from '../../modules/authority/utils';

export function getCapabilityList(req, res, next) {
  const { carrierId } = req.params;
  const resources = getResources();

  const authorityManager = new Authority(resources, { carrierId });

  logger.debug('getting authority for carrier: %s', carrierId);

  authorityManager
    .getMenuItems()
    .then(menuItems => {
      logger.debug('authority returned for carrier: %s', carrierId, menuItems);
      res.apiResponse(200, {
        meta: {
          carrierId,
        },
        data: {
          type: 'company',
          // TODO: a resource object MUST contain `id` key
          attributes: {
            authorities: menuItems,
          },
        },
      });
    })
    .catch(err => {
      logger.error('failed to get authority for carrier: %s', carrierId, err);
      next(err);
    });
}
