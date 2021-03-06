import { defineMessages } from 'react-intl';

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
  saved: {
    id: 'saved',
    defaultMessage: 'Saved',
  },
  deleteEndUserSuccess: {
    id: 'endUser.deleteUserSuccess',
    defaultMessage: '{user} is deleted successfully',
  },
  deactiveUserSuccess: {
    id: 'endUser.deactiveUserSuccess',
    defaultMessage: 'User deactivated',
  },
  deactiveUserFail: {
    id: 'endUser.deactiveUserFail',
    defaultMessage: 'User deactivation failed',
  },
  reactiveEndUserSuccess: {
    id: 'endUser.reactiveEndUserSuccess',
    defaultMessage: 'User activated',
  },
  reactiveEndUserFail: {
    id: 'endUser.reactiveEndUserFail',
    defaultMessage: 'User activation failed',
  },
  fetchEndUserWalletFail: {
    id: 'endUser.fetchEndUserWalletFail',
    defaultMessage: 'Failed to get user wallet',
  },
  createAccountSuccess: {
    id: 'account.createAccountSuccess',
    defaultMessage: 'Create account success!',
  },
  updateAccountSuccess: {
    id: 'account.updateAccountSuccess',
    defaultMessage: 'Update account success!',
  },
  deleteAccountSuccess: {
    id: 'account.deleteAccountSuccess',
    defaultMessage: 'Delete account success!',
  },
  createSignupRulesSuccess: {
    id: 'user.createSignupRulesSuccess',
    defaultMessage: '{number} new users created',
  },
});
