import _ from 'lodash';
import { defineMessages } from 'react-intl';
import countryData from 'country-data';
import timezoneData from 'timezones.json';

import { arrayToObject } from '../../../main/components/arrayToObject';

export const COUNTRIES = countryData.countries.all.map((item) => ({
  value: item.name,
  label: item.name,
}));

let timezoneArray = [];
_.each(timezoneData, (item) => {
  timezoneArray = timezoneArray.concat(item.utc);
});
export const TIMEZONE = arrayToObject(timezoneArray);

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
