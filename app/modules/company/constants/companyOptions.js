import _ from 'lodash';
import { defineMessages } from 'react-intl';
import countryData from 'country-data';
import timezoneData from 'timezones.json';

// @TODO missing i18n
export const COUNTRIES = _.sortBy(countryData.countries.all.map((item) => ({
  value: item.name,
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
});

export const CAPABILITIES = {
  'platform.android': 'Android',
  'platform.ios': 'IOS',
  'platform.web': 'Web',
  'call.offnet': 'Off-Net Call',
  'call.onnet': 'On-Net Call',
  'call.maaii-in': 'Maii-in Call',
  im: 'IM',
  'im.im_to_sms': 'IM To SMS',
  'verification.mo': 'MO Verification',
  'verification.mt': 'MT Verification',
  'verification.sms': 'SMS Verification',
  'verification.ivr': 'IVR Verification',
  push: 'PUSH',
  vsf: 'VSF',
};

export const COMPANY_TYPE = {
  SDK: 'SDK',
  WHITE_LABEL: 'WHITE LABEL',
};
export const PAYMENT_TYPE = {
  PRE_PAID: 'Pre-Paid',
  POST_PAID: 'Post Paid',
};
