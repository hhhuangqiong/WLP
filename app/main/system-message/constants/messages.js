import { defineMessages } from 'react-intl';

import { TOP_UP_ERROR_CODE } from './errorCodes';

export const MESSAGES = defineMessages({
  signInBadRequest: {
    id: 'sign-in.error.badRequest',
    defaultMessage: 'Username or password is missing. Please complete the form and try again',
  },
  signInGeneral: {
    id: 'sign-in.error.general',
    defaultMessage: 'The username and password you entered do not match.',
  },
  signInTimeout: {
    id: 'sign-in.error.timeout',
    defaultMessage: 'The process timed out. Please try again later.',
  },
  signInInternalServerError: {
    id: 'sign-in.error.internalServerError',
    defaultMessage: 'The process encountered an unexpected error. Please contact support for assistance.',
  },
  topUpMaxLimitError: {
    id: 'topUp.error.maxLimit',
    defaultMessage: 'The balance after top up exceeds maximum limit',
  },
  topUpMinAmountError: {
    id: 'topUp.error.minAmount',
    defaultMessage: 'Top up amount is too small',
  },
});
