import { defineMessages } from 'react-intl';

export const CALL_TYPE = {
  ALL: '',
  ONNET: 'ONNET',
  OFFNET: 'OFFNET',
  MAAII_IN: 'MAAII_IN',
};

export const CALL_EXPORT_REPORT_TYPE = {
  USAGE: 'Usage',
  RETAIL_PRICE: 'Retail Price',
};

export const CALL_EXPORT = {
  callExport: 'callExport',
  callCostExport: 'callCostExport',
};

export const MESSAGES = defineMessages({
  selectType: {
    id: 'selectType',
    defaultMessage: 'Select a country',
  },
});
