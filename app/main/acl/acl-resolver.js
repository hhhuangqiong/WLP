import Q from 'q';
import { isObject, includes, any, difference, flatten, map } from 'lodash';

import { RESOURCE, CAPABILITY, permission, SERVICE_TYPE, CHARGE_WALLET, PAYMENT_MODE } from './acl-enums';

function flattenPermissions(permissions) {
  return flatten(
    map(permissions, (actions, resource) => actions.map(action => (`${resource}:${action}`)))
  );
}

function deriveProhibitions(capabilities) {
  // This defines resource/permission availability depending on capabilities
  // Not sure if this mapping is correct
  const PERMISSION_DEPENDENCIES = {
    [permission(RESOURCE.GENERAL)]: c => !includes(c, CAPABILITY.SERVICE_SDK),
    [permission(RESOURCE.END_USER)]: c => includes(c, CAPABILITY.WALLET_END_USER),
    [permission(RESOURCE.CALL)]: c => any(c, x => /^call/.test(x)),
    [permission(RESOURCE.IM)]: c => includes(c, CAPABILITY.IM),
    [permission(RESOURCE.SMS)]: c => includes(c, CAPABILITY.IM_TO_SMS),
    [permission(RESOURCE.VSF)]: c => includes(c, CAPABILITY.VSF),
    [permission(RESOURCE.TOP_UP)]: c => any(c, x => /^wallet/.test(x)),
    [permission(RESOURCE.VERIFICATION_SDK)]: c => any(c, x => /^verification/.test(x)),
  };
  /* eslint no-confusing-arrow: 0 */
  const prohibitions = map(PERMISSION_DEPENDENCIES, (rule, p) => rule(capabilities) ? null : p)
    .filter(p => p !== null);
  return prohibitions;
}

export function createAclResolver(logger, iamClient, provisionHelper) {
  async function getCapabilities(carrierId) {
    const item = await provisionHelper.getProvisionByCarrierId(carrierId);
    if (!item.profile || !item.profile.capabilities) {
      return [];
    }
    const capabilities = item.profile.capabilities;
    // push those service type and payment type as capability
    if (SERVICE_TYPE[item.profile.serviceType]) {
      capabilities.push(SERVICE_TYPE[item.profile.serviceType]);
    }

    if (PAYMENT_MODE[item.profile.paymentMode]) {
      capabilities.push(PAYMENT_MODE[item.profile.paymentMode]);
    }
    // @TODO chargeWallet is not shown
    if (CHARGE_WALLET[item.profile.chargeWallet]) {
      capabilities.push(CHARGE_WALLET[item.profile.chargeWallet]);
    }
    return capabilities;
  }

  async function resolve(params) {
    if (!isObject(params)) {
      throw new Error('Expected params to be an object.');
    }
    if (!params.username) {
      throw new Error('Expected context to contain username');
    }
    if (!params.carrierId) {
      throw new Error('Expected context to contain carrierId');
    }
    /* eslint prefer-const: 0 */
    const companyId = await provisionHelper.getCompanyIdByCarrierId(params.carrierId);
    logger.debug('Resolved carrierId to be companyId %s', companyId);
    // if no companyId, it will be no permission and capabilities
    if (!companyId) {
      return {
        capabilities: [],
        permissions: [],
      };
    }
    let [userPermissions, companyCapabilities] = await Q.all([
      iamClient.getUserPermissions({
        service: 'wlp',
        company: companyId,
        username: params.username,
      }),
      getCapabilities(params.carrierId),
    ]);
    // Flatten user permissions to a single array, e.g. ["resource:read", "resource:create"]
    userPermissions = flattenPermissions(userPermissions);
    // Filter out permissions that are not enabled due to company capabilities
    const prohibitions = deriveProhibitions(companyCapabilities);
    userPermissions = difference(userPermissions, prohibitions);
    logger.debug('Resolved permissions for user %s for carrier %s', params.username, params.carrierId);
    return {
      capabilities: companyCapabilities,
      permissions: userPermissions,
    };
  }

  return {
    resolve,
  };
}
