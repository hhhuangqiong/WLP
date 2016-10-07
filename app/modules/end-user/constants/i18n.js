import { defineMessages } from 'react-intl';

export const MESSAGES = defineMessages({
  allRecords: {
    id: 'allRecords',
    defaultMessage: 'All records',
  },
  errorRecords: {
    id: 'errorRecords',
    defaultMessage: 'Error records',
  },
  deleteText: {
    id: 'message.deleteText',
    defaultMessage: 'Are you sure to delete {value}?',
  },
  reachLimitDialogHeader: {
    id: 'message.reachLimitDialogHeader',
    defaultMessage: 'Limit Reached',
  },
  reachLimitDialogMessage: {
    id: 'message.reachLimitDialogMessage',
    defaultMessage: 'You have reached the limit of {limit} records add to the User Activation List.',
  },
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
  deleteDialogHeader: {
    id: 'user.whitelist.deleteDialogHeader',
    defaultMessage: 'Remove User from Activation User List',
  },
  deleteDialogMessage: {
    id: 'user.whitelist.deleteDialogMessage',
    defaultMessage: 'Are you sure you want to remove {name} from Activation User List?<br/><br/>This user will not be suspended by this action. But this account will not be able to reactivate again.',
  },
  leaveAlertMessage: {
    id: 'user.whitelist.leaveAlertMessage',
    defaultMessage: 'Leave with unsaved change?',
  },
});
