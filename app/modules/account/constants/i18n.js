import { defineMessages } from 'react-intl';

export const MESSAGES = defineMessages({
  createNewAccount: {
    id: 'account.createNewAccount',
    defaultMessage: 'Create New Account',
  },
  users: {
    id: 'account.users',
    defaultMessage: 'Users',
  },
  accountInformation: {
    id: 'account.accountInformation',
    defaultMessage: 'Account Information',
  },
  search: {
    id: 'searchByEmail',
    defaultMessage: 'Search By Email',
  },
  reverify: {
    id: 'reverify',
    defaultMessage: 'Reverify',
  },
  firstName: {
    id: 'firstName',
    defaultMessage: 'First Name',
  },
  lastName: {
    id: 'lastName',
    defaultMessage: 'Last Name',
  },
  email: {
    id: 'email',
    defaultMessage: 'Email',
  },
  selectCompany: {
    id: 'account.selectCompany',
    defaultMessage: 'Select a company',
  },
  selectRole: {
    id: 'account.selectRole',
    defaultMessage: 'Select role',
  },
  deleteDialogMessage: {
    id: 'account.deleteDialogMessage',
    defaultMessage: 'Are you sure you want to delete the account <span class="high-light">"{name}"</span>?<br/><br/><span class="high-light">Warning: This action will permanently delete the account from the system.</span>',
  },
  deleteDialogHeader: {
    id: 'account.deleteDialogHeader',
    defaultMessage: 'Delete Account',
  },
  reverifyDialogMessage: {
    id: 'account.reverifyDialogMessage',
    defaultMessage: 'Are you sure you want to send verification email to the account <span class="high-light">"{name}"</span>?',
  },
  reverifyDialogHeader: {
    id: 'account.reverifyDialogHeader',
    defaultMessage: 'Reverify Account',
  },
});
