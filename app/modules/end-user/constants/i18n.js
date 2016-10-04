import { defineMessages } from 'react-intl';

export const MESSAGES = defineMessages({
  phoneNumberEmptyError: {
    id: 'user.phoneNumberEmptyError',
    defaultMessage: 'Phone Number cannot be empty',
  },
  invalidFormatError: {
    id: 'user.invalidFormatError',
    defaultMessage: 'Invalid format',
  },
  duplicatedRecordError: {
    id: 'user.duplicatedRecordError',
    defaultMessage: 'Duplicated record',
  },
  unknownError: {
    id: 'user.unknownError',
    defaultMessage: 'Unknown error',
  },
});
