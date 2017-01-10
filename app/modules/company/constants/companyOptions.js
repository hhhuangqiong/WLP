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
  smscSetting: {
    id: 'companySmscSetting',
    defaultMessage: 'SMSC Setting',
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
  // server return the voc in service type
  vocWallet: {
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
  // server return the voc in service type
  voc: {
    id: 'voice',
    defaultMessage: 'Voice',
  },
  submit: {
    id: 'submit',
    defaultMessage: 'Submit',
  },
  noDataAvailable: {
    id: 'noDataAvailable',
    defaultMessage: 'There is no data available. Please, try again later.',
  },
  loading: {
    id: 'loading',
    defaultMessage: 'Loading...',
  },
  SystemError: {
    id: 'company.SystemError',
    defaultMessage: 'SystemError',
  },
  HttpStatusError: {
    id: 'company.HttpStatusError',
    defaultMessage: 'HttpStatusError',
  },
  SystemErrorDescription: {
    id: 'company.SystemErrorDescription',
    defaultMessage: 'System error occurred. Contact support with the following trace id',
  },
  HttpStatusErrorDescription: {
    id: 'company.HttpStatusErrorDescription',
    defaultMessage: 'HttpStatusError error occurred. Contact support with the following trace id',
  },
  ip: {
    id: 'ip',
    defaultMessage: 'ip',
  },
  port: {
    id: 'port',
    defaultMessage: 'port',
  },
  smscBinding: {
    id: 'SMSCbinding',
    defaultMessage: 'SMSC binding',
  },
  SDK: {
    id: 'SDK',
    defaultMessage: 'SDK',
  },
  whiteLabel: {
    id: 'whiteLabel',
    defaultMessage: 'WHITE LABEL',
  },
  defaultSMSC: {
    id: 'defaultSMSC',
    defaultMessage: 'Default SMSC',
  },
  customSMSC: {
    id: 'customSMSC',
    defaultMessage: 'Custom SMSC',
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

export const COMPANY_TYPE = {
  SDK: 'SDK',
  WHITE_LABEL: 'WHITE_LABEL',
};

export const COMPANY_OPTION = [{
  value: COMPANY_TYPE.SDK,
  label: MESSAGES.SDK,
}, {
  value: COMPANY_TYPE.WHITE_LABEL,
  label: MESSAGES.whiteLabel,
}];

export const PAYMENT_TYPE = {
  PRE_PAID: 'PRE_PAID',
  POST_PAID: 'POST_PAID',
};

export const PAYMENT_OPTION = [{
  value: PAYMENT_TYPE.PRE_PAID,
  label: MESSAGES.prePaid,
}, {
  value: PAYMENT_TYPE.POST_PAID,
  label: MESSAGES.postPaid,
}];

export const WALLET_TYPE = {
  NONE: 'WALLET_NONE',
  END_USER: 'WALLET_END_USER',
  OCS_INTEGRATION: 'WALLET_OCS_INTEGRATION',
  COMPANY: 'WALLET_COMPANY',
};

export const SMSC_TYPE = {
  DEFAULT: 'DEFAULT',
  CUSTOM: 'CUSTOM',
};

export const SMSC_OPTION = [{
  value: SMSC_TYPE.DEFAULT,
  label: MESSAGES.defaultSMSC,
}, {
  value: SMSC_TYPE.CUSTOM,
  label: MESSAGES.customSMSC,
}];

export const SMSC_DATA_ID = {
  USERNAME: 'smscValues.username',
  PASSWORD: 'smscValues.password',
  IP: 'smscValues.binding.ip',
  PORT: 'smscValues.binding.port',
  BINDINGS: 'smsc.bindings',
  BINDING: 'smscValues.binding',
  TYPE: 'smscValues.type',
};

export const WALLET_SERVICE_TYPE = {
  SMS: 'sms',
  VOICE: 'voc',
};
