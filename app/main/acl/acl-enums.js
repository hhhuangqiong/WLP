import { includes } from 'lodash';

// Enum taken from https://issuetracking.maaii.com:9443/pages/viewpage.action?pageId=19663526#MaaiiProvisioningService(MPS)-CreateProvisioning
// See enum capability
export const CAPABILITY = {
  SERVICE_WHITE_LABEL: 'service.white_label',
  SERVICE_SDK: 'service.sdk',

  PLATFORM_ANDROID: 'platform.android',
  PLATFORM_IOS: 'platform.ios',
  PLATFORM_WEB: 'platform.web',

  CALL_OFFNET: 'call.offnet',
  CALL_ONNET: 'call.onnet',
  CALL_MAAII_IN: 'call.maaii_in',

  IM: 'im',
  IM_TO_SMS: 'im.im-to-sms',

  WALLET_COMPANY: 'wallet.company',
  WALLET_END_USER: 'wallet.end-user',
  WALLET_CUSTOMER_OCS_INTEGRATION: 'wallet.customer-ocs-integration',

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

  PAYMENT_PRE_PAID: 'payment.pre_paid',
  PAYMENT_POST_PAID: 'payment.post_paid',
};

export const CAPABILITIES = Object.values(CAPABILITY);

export const RESOURCE = {
  COMPANY: 'company',
  USER: 'user',
  ROLE: 'role',
  GENERAL: 'wlp:generalOverview',
  END_USER: 'wlp:endUser',
  TOP_UP: 'wlp:topUp',
  VSF: 'wlp:vsf',
  CALL: 'wlp:call',
  IM: 'wlp:im',
  SMS: 'wlp:sms',
  VERIFICATION_SDK: 'wlp:verification-sdk',
};

export const RESOURCES = Object.values(RESOURCE);

export const ACTION = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
};

export const ACTIONS = Object.values(ACTION);

export function permission(resource, action = ACTION.READ) {
  if (!includes(RESOURCES, resource)) {
    throw new Error(`Unknown resource: ${resource}`);
  }
  if (!includes(ACTIONS, action)) {
    throw new Error(`Unknown action: ${action}`);
  }
  return `${resource}:${action}`;
}

export const SERVICE_TYPE = {
  SDK: CAPABILITY.SERVICE_SDK,
  WHITE_LABEL: CAPABILITY.SERVICE_WHITE_LABEL,
};

export const CHARGE_WALLET = {
  WALLET_END_USER: CAPABILITY.WALLET_END_USER,
  WALLET_COMPANY: CAPABILITY.WALLET_COMPANY,
  WALLET_OCS_INTEGRATION: CAPABILITY.WALLET_CUSTOMER_OCS_INTEGRATION,
};

export const PAYMENT_MODE = {
  PRE_PAID: CAPABILITY.PAYMENT_PRE_PAID,
  POST_PAID: CAPABILITY.PAYMENT_POST_PAID,
};
