import _ from 'lodash';
import { defineMessages } from 'react-intl';
import countryData from 'country-data';
import timezoneData from 'timezones.json';

// @TODO missing i18n
export const COUNTRIES = _.sortBy(countryData.countries.all.map((item) => ({
  // use the alpha2 which is 2-letter country code defined in ISO 3166-2
  value: item.alpha2,
  label: item.name,
})), country => country.label);

// @TODO missing i18n
export const TIMEZONE = _.map(timezoneData, (item) => ({
  value: item.value,
  label: item.text,
}));

export const MESSAGES = defineMessages({
  companyProfile: {
    id: 'companyProfile',
    defaultMessage: 'Company Profile',
  },
  companyDescription: {
    id: 'companyDescription',
    defaultMessage: 'Company Description',
  },
  companyCapabilities: {
    id: 'companyCapabilities',
    defaultMessage: 'Company Capabilities',
  },
  companyCode: {
    id: 'companyCode',
    defaultMessage: 'Company Code',
  },
  companyName: {
    id: 'companyName',
    defaultMessage: 'Company Name',
  },
  country: {
    id: 'country',
    defaultMessage: 'Country',
  },
  timezone: {
    id: 'timezone',
    defaultMessage: 'Timezone',
  },
  backToCompanies: {
    id: 'backToCompanies',
    defaultMessage: 'Back To Companies',
  },
  wallet: {
    id: 'wallet',
    defaultMessage: 'Wallet',
  },
  voiceWallet: {
    id: 'voiceWallet',
    defaultMessage: 'Voice Wallet',
  },
  smsWallet: {
    id: 'smsWallet',
    defaultMessage: 'SMS Wallet',
  },
  details: {
    id: 'details',
    defaultMessage: 'Details',
  },
  date: {
    id: 'date',
    defaultMessage: 'Date',
  },
  topUpValue: {
    id: 'topUpValue',
    defaultMessage: 'Top Up Value',
  },
  balance: {
    id: 'balance',
    defaultMessage: 'Balance',
  },
  paymentType: {
    id: 'paymentType',
    defaultMessage: 'Payment Type',
  },
  prePaid: {
    id: 'prePaid',
    defaultMessage: 'Pre-Paid',
  },
  postPaid: {
    id: 'postPaid',
    defaultMessage: 'Post-Paid',
  },
  type: {
    id: 'type',
    defaultMessage: 'Type',
  },
  description: {
    id: 'description',
    defaultMessage: 'Description',
  },
  currentBalance: {
    id: 'currentBalance',
    defaultMessage: 'Current Balance',
  },
  topUpAmount: {
    id: 'topUpAmount',
    defaultMessage: 'Top Up Amount',
  },
  topUpDescription: {
    id: 'topUpDescription',
    defaultMessage: 'Top Up Description',
  },
  sms: {
    id: 'sms',
    defaultMessage: 'SMS',
  },
  voice: {
    id: 'voice',
    defaultMessage: 'Voice',
  },
  submit: {
    id: 'submit',
    defaultMessage: 'Submit',
  },
});

export const CAPABILITIES = {
  'platform.android': 'Android',
  'platform.ios': 'IOS',
  'platform.web': 'Web',
  'call.offnet': 'Off-Net Call',
  'call.onnet': 'On-Net Call',
  'call.maaii-in': 'Maii-in Call',
  im: 'IM',
  'im.im-to-sms': 'IM To SMS',
  'verification.mo': 'MO Verification',
  'verification.mt': 'MT Verification',
  'verification.sms': 'SMS Verification',
  'verification.ivr': 'IVR Verification',
  push: 'PUSH',
  vsf: 'VSF',
  'end-user.suspension': 'End User Suspension',
  'end-user.whitelist': 'End User Whitelist',
};

export const COMPANY_TYPE_LABEL = {
  SDK: 'SDK',
  WHITE_LABEL: 'WHITE LABEL',
};
export const PAYMENT_TYPE_LABEL = {
  PRE_PAID: 'Pre-Paid',
  POST_PAID: 'Post Paid',
};
export const PAYMENT_TYPE = {
  PRE_PAID: 'PRE_PAID',
  POST_PAID: 'POST_PAID',
};
export const WALLET_TYPE = {
  NONE: 'WALLET_NONE',
  END_USER: 'WALLET_END_USER',
  OCS_INTEGRATION: 'WALLET_OCS_INTEGRATION',
  COMPANY: 'WALLET_COMPANY',
};
