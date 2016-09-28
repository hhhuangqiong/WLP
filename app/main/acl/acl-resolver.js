import { isObject, includes, any, difference, flatten, map, defaults } from 'lodash';
import { NotFoundError } from 'common-errors';

import { RESOURCE, CAPABILITY, permission, ACTION, RESOURCE_OWNER } from './acl-enums';

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

  function extractProfile(provisioning, identifier) {
    if (!provisioning || !provisioning.profile) {
      logger.debug(`Failed to find provisioning for company: ${identifier}.`);
      throw new NotFoundError('Provisioning');
    }
    return provisioning.profile;
  }

  async function getProvisioningProfileByCarrierId(carrierId) {
    const item = await provisionHelper.getProvisionByCarrierId(carrierId);
    return extractProfile(item);
  }

  async function getProvisioningProfileByCompanyId(companyId) {
    const item = await provisionHelper.getProvisionByCompanyId(companyId);
    return extractProfile(item);
  }

  async function resolve(params = {}) {
    params = defaults(params, {
      owner: RESOURCE_OWNER.CURRENT_COMPANY,
    });
    if (!isObject(params)) {
      throw new Error('Expected params to be an object.');
    }
    if (!params.username) {
      throw new Error('Expected context to contain username');
    }
    if (!params.carrierId) {
      throw new Error('Expected context to contain carrierId');
    }
    let provisioningProfile = await getProvisioningProfileByCarrierId(params.carrierId);
    if (params.owner === RESOURCE_OWNER.PARENT_COMPANY) {
      const company = await iamClient.getCompany({ id: provisioningProfile.companyId });
      if (company.parent) {
        provisioningProfile = getProvisioningProfileByCompanyId(company.parent);
      }
    }
    let userPermissions = await iamClient.getUserPermissions({
      service: 'wlp',
      company: provisioningProfile.companyId,
      username: params.username,
    });
    // Flatten user permissions to a single array, e.g. ["resource:read", "resource:create"]
    userPermissions = flattenPermissions(userPermissions);
    // Filter out permissions that are not enabled due to company capabilities
    const prohibitions = deriveProhibitions(provisioningProfile);
    userPermissions = difference(userPermissions, prohibitions);
    logger.debug('Resolved permissions for user %s for carrier %s', params.username, params.carrierId);
    return {
      capabilities: provisioningProfile.capabilities,
      permissions: userPermissions,
    };
  }

  return {
    resolve,
  };
}
