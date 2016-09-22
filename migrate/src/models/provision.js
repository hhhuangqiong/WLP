import logger from 'winston';

import { transformObject } from '../utils';

function capabilitiesTransform(value) {
  const provision = {
    profile: {
      capabilities: [],
    },
  };
  if (value.indexOf('service.white_label') > -1) {
    provision.profile.serviceType = 'WHITE_LABEL';
  }
  if (value.indexOf('service.sdk') > -1) {
    provision.profile.serviceType = 'SDK';
  }
  if (value.indexOf('wallet.none') > -1) {
    provision.profile.chargeWallet = 'WALLET_NONE';
  }
  if (value.indexOf('wallet.single') > -1) {
    provision.profile.chargeWallet = 'WALLET_END_USER';
  }
  if (value.indexOf('wallet.multiple') > -1) {
    provision.profile.chargeWallet = 'WALLET_OCS_INTEGRATION';
  }
  if (value.indexOf('wallet.shared') > -1) {
    provision.profile.chargeWallet = 'WALLET_COMPANY';
  }
  if (value.indexOf('top_up') > -1) {
    provision.profile.paymentMode = 'PRE_PAID';
  } else {
    // if no top up capabilities, it will be all post paid
    provision.profile.paymentMode = 'POST_PAID';
  }
  if (value.indexOf('device.ios') > -1) {
    provision.profile.capabilities.push('platform.ios');
  }
  if (value.indexOf('device.ios') > -1) {
    provision.profile.capabilities.push('platform.android');
  }
  if (value.indexOf('call.onnet_call') > -1) {
    provision.profile.capabilities.push('call.onnet');
  }
  if (value.indexOf('call.offnet_call') > -1) {
    provision.profile.capabilities.push('call.offnet');
  }
  if (value.indexOf('im.im_to_sms') > -1) {
    provision.profile.capabilities.push('im.im-to-sms');
  }
  if (value.indexOf('im') > -1) {
    provision.profile.capabilities.push('im');
  }
  if (value.indexOf('vsf') > -1) {
    provision.profile.capabilities.push('vsf');
  }
  if (value.indexOf('verification-sdk.mt') > -1) {
    provision.profile.capabilities.push('verification.mt');
  }
  if (value.indexOf('verification-sdk.mo') > -1) {
    provision.profile.capabilities.push('verification.mo');
  }
  if (value.indexOf('verification-sdk.sms') > -1) {
    provision.profile.capabilities.push('verification.sms');
  }
  if (value.indexOf('verification-sdk.ivr') > -1) {
    provision.profile.capabilities.push('verification.ivr');
  }

  // default for the profile charge wallet is none
  provision.profile.chargeWallet = provision.profile.chargeWallet || 'WALLET_NONE';
  return provision;
}

function carrierIdTransform(value) {
  const codePart = value.split('.');
  return {
    profile: {
      carrierId: value,
      companyCode: codePart[0],
    },
  };
}
export function formatNewProvision(company) {
  logger.info(`[Export]Formatting new Provision ${company.name}`);
  // update the company format
  // oldKeyName: newKeyName
  const copyKeys = {
    _id: value => ({ profile: { companyId: value } }),
    carrierId: carrierIdTransform,
    capabilities: capabilitiesTransform,
    country: value => ({ profile: { country: value } }),
    parentCarrierId: value => ({ profile: { resellerCarrierId: value } }),
    createAt: 'createdAt',
    updateAt: 'updatedAt',
  };
  // all the existing company are status completed
  return transformObject(company, { status: 'COMPLETE' }, copyKeys);
}
