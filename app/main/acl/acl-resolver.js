import Q from 'q';
import { isObject, includes, any, difference, flatten, map } from 'lodash';
import { NotFoundError } from 'common-errors';

import { RESOURCE, CAPABILITY, permission, ACTION } from './acl-enums';

function flattenPermissions(permissions) {
  return flatten(
    map(permissions, (actions, resource) => actions.map(action => (`${resource}:${action}`)))
  );
}

function deriveProhibitions(carrierProfile) {
  // This defines resource/permission availability depending on capabilities
  // Not sure if this mapping is correct
  const PERMISSION_DEPENDENCIES = {
    [permission(RESOURCE.GENERAL)]: ({ serviceType }) => serviceType !== 'SDK',
    [permission(RESOURCE.END_USER)]: () => true, // all companies will show end user section
    [permission(RESOURCE.END_USER, ACTION.UPDATE)]: ({ capabilities }) =>
      includes(capabilities, CAPABILITY.END_USER_SUSPENSION), // activate, suspend user
    [permission(RESOURCE.CALL)]: ({ capabilities }) => any(capabilities, x => /^call/.test(x)),
    [permission(RESOURCE.WHITELIST)]: ({ capabilities }) =>
      includes(capabilities, CAPABILITY.END_USER_WHITELIST),
    [permission(RESOURCE.IM)]: ({ capabilities }) => includes(capabilities, CAPABILITY.IM),
    [permission(RESOURCE.SMS)]: ({ capabilities }) => includes(capabilities, CAPABILITY.IM_TO_SMS),
    [permission(RESOURCE.VSF)]: ({ capabilities }) => includes(capabilities, CAPABILITY.VSF),
    [permission(RESOURCE.TOP_UP)]: ({ paymentMode }) => paymentMode === 'PRE_PAID', // show top up when it is pre-paid
    [permission(RESOURCE.VERIFICATION_SDK)]: ({ serviceType, capabilities }) =>
      any(capabilities, x => /^verification/.test(x)) || serviceType === 'SDK',
  };
  /* eslint no-confusing-arrow: 0 */
  const prohibitions = map(PERMISSION_DEPENDENCIES, (rule, p) => rule(carrierProfile) ? null : p)
    .filter(p => p !== null);
  return prohibitions;
}

export function createAclResolver(logger, iamClient, provisionHelper) {
  async function getCarrierProfile(carrierId) {
    const item = await provisionHelper.getProvisionByCarrierId(carrierId);
    if (!item || !item.profile) {
      logger.debug('Fail to carrier profile');
      throw new NotFoundError('Carrier profile');
    }
    return {
      capabilities: item.profile.capabilities,
      paymentMode: item.profile.paymentMode,
      chargeWallet: item.profile.chargeWallet,
      serviceType: item.profile.serviceType,
    };
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
      logger.debug('Fail to find company');
      throw new NotFoundError('company');
    }
    let [userPermissions, carrierProfile] = await Q.all([
      iamClient.getUserPermissions({
        service: 'wlp',
        company: companyId,
        username: params.username,
      }),
      getCarrierProfile(params.carrierId),
    ]);
    // Flatten user permissions to a single array, e.g. ["resource:read", "resource:create"]
    userPermissions = flattenPermissions(userPermissions);
    // Filter out permissions that are not enabled due to company capabilities
    const prohibitions = deriveProhibitions(carrierProfile);
    userPermissions = difference(userPermissions, prohibitions);
    logger.debug('Resolved permissions for user %s for carrier %s', params.username, params.carrierId);
    return {
      capabilities: carrierProfile.capabilities,
      permissions: userPermissions,
    };
  }

  return {
    resolve,
  };
}
