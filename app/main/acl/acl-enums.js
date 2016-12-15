import { includes } from 'lodash';

// Enum taken from https://issuetracking.maaii.com:9443/pages/viewpage.action?pageId=19663526#MaaiiProvisioningService(MPS)-CreateProvisioning
// See enum capability
export const CAPABILITY = {
  PLATFORM_ANDROID: 'platform.android',
  PLATFORM_IOS: 'platform.ios',
  PLATFORM_WEB: 'platform.web',

  CALL_OFFNET: 'call.offnet',
  CALL_ONNET: 'call.onnet',
  CALL_MAAII_IN: 'call.maaii_in',

  IM: 'im',
  IM_TO_SMS: 'im.im-to-sms',

  VERIFICATION_MO: 'verification.mo',
  VERIFICATION_MT: 'verification.mt',
  VERIFICATION_SMS: 'verification.sms',
  VERIFICATION_IVR: 'verification.ivr',

  PUSH: 'push',

  VSF: 'vsf',
  VSF_ITEM_ANIMATION: 'vsf.item.animation',
  VSF_ITEM_AUDIO_EFFECT: 'vsf.item.audio_effect',
  VSF_ITEM_CREDIT: 'vsf.item.credit',
  VSF_ITEM_CUSTOMIZED: 'vsf.item.customized',
  VSF_ITEM_STICKER: 'vsf.item.sticker',

  END_USER_WHITELIST: 'end-user.whitelist',
  END_USER_SUSPENSION: 'end-user.suspension',
};

export const CAPABILITIES = Object.values(CAPABILITY);

// resources will be the front end and WLP resources
export const RESOURCE = {
  COMPANY: 'company',
  USER: 'user',
  ROLE: 'role',
  GENERAL: 'generalOverview',
  END_USER: 'endUser',
  TOP_UP: 'topUp',
  VSF: 'vsf',
  CALL: 'call',
  IM: 'im',
  SMS: 'sms',
  VERIFICATION_SDK: 'verificationSdk',
  WHITELIST: 'whitelist',
  CALL_EXPORT: 'callExport',
  IM_EXPORT: 'imExport',
  END_USER_EXPORT: 'endUserExport',
  SMS_EXPORT: 'smsExport',
};

export const RESOURCES = Object.values(RESOURCE);

export const ACTION = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
};

export const ACTIONS = Object.values(ACTION);

export const RESOURCE_OWNER = {
  CURRENT_COMPANY: 'current',
  PARENT_COMPANY: 'parent',
};

export function permission(resource, action = ACTION.READ) {
  if (!includes(RESOURCES, resource)) {
    throw new Error(`Unknown resource: ${resource}`);
  }
  if (!includes(ACTIONS, action)) {
    throw new Error(`Unknown action: ${action}`);
  }
  return `${resource}:${action}`;
}
