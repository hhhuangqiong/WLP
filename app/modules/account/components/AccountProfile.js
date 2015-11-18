import _ from 'lodash';
import React, { PropTypes } from 'react';
import Joi from 'joi';

import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import AuthMixin from '../../../utils/AuthMixin';

import ApplicationStore from '../../../main/stores/ApplicationStore';
import AccountStore from '../stores/AccountStore';

import fetchAccounts from '../actions/fetchAccounts';
import createAccount from '../actions/createAccount';
import updateAccount from '../actions/updateAccount';
import deleteAccount from '../actions/deleteAccount';
import resendCreatePassword from '../actions/resendCreatePassword';

import AccountForm from './AccountForm';
import AccountActionBar from './AccountActionBar';
import AccountInfo from './AccountInfo';

import { assertError } from '../../../main/components/ValidateDecorator';

const DELETE_ACCOUNT_MSG = 'Are you sure to delete this account?';
const NEW_ACCOUNT_ROUTE_NAME = 'account-create';
const EDIT_ACCOUNT_TITLE = 'ACCOUNT INFORMATION';
const CREATE_ACCOUNT_TITLE = 'CREATE ACCOUNT';
const CHANGE_PASSWORD_TOKEN = 'change-password';
const NAME_VALIDATION = Joi.string().min(1).max(30).required();
const EMAIL_VALIDATION = Joi.string().email().required();

export default React.createClass({
  displayName: 'AccountProfile',

  mixins: [FluxibleMixin, AuthMixin],

  contextTypes: {
    executeAction: PropTypes.func.isRequired,
    router: PropTypes.func.isRequired
  },

  statics: {
    storeListeners: [AccountStore]
  },

  getInitialState() {
    return this.getStateFromStores();
  },

  onChange() {
    this.setState(this.getStateFromStores());
  },

  defaultState() {
    return {
      isError: true
    }
  },

  getStateFromStores() {
    let { accountId } = this.context.router.getCurrentParams();
    let stateFromStores = {};

    if (this.isCreate()) {
      stateFromStores = this.getStore(AccountStore).getNewAccount();
    } else if (accountId) {
      stateFromStores = this.getStore(AccountStore).getAccountByAccountId(accountId);
    }

    return _.merge(stateFromStores, this.defaultState());
  },

  isCreate() {
    let currentRoute = _.last(this.context.router.getCurrentRoutes());
    return currentRoute.name === NEW_ACCOUNT_ROUTE_NAME;
  },

  handleFirstNameChange(event) {
    this.setState({
      firstName: event.target.value,
      isError: assertError(event, NAME_VALIDATION)
    });
  },

  handleLastNameChange(event) {
    this.setState({
      lastName: event.target.value,
      isError: assertError(event, NAME_VALIDATION)
    });
  },

  handleEmailChange(event) {
    this.setState({
      email: event.target.value,
      isError: assertError(event, EMAIL_VALIDATION)
    });
  },

  handleGroupChange(assignedGroup) {
    this.setState({ assignedGroup });
  },

  handleCompanyChange(data) {
    // it is not a valid array if the length of string is less than 3
    if (data.length < 3) return;

    // the onChange function provided by react-select return a string with separeted comma representing an array of changes
    let companyRemains = !data.length ? [] : data.split(',');

    let assignedCompanies = _.map(companyRemains, name => {
      return _.find(this.state.selectedAccount.assignedCompanies, company => name === company.name);
    });

    this.setState({ assignedCompanies });
  },

  handleErrorState(isError) {
    this.setState({ isError });
  },

  handleSave() {
    if (this.state.isError && !this.isValueChanged()) return;

    let data = {
      name: {
        first: this.state.firstName,
        last: this.state.lastName
      },
      username: this.state.email,
      assignedGroup: this.state.assignedGroup,
      assignedCompanies: this.state.assignedCompanies
    };

    if (this.isCreate()) {
      this.context.executeAction(createAccount, { data });
    } else {
      data.userId = this.state.accountId;
      this.context.executeAction(updateAccount, { data });
    }
  },

  isValueChanged() {
    let {
      firstName,
      lastName,
      email
    } = this.state;

    return firstName.length && lastName.length && email.length;
  },

  handleDiscard() {
    if (!this.isValueChanged()) return;
    this.setState(this.getStateFromStores());
  },

  handleDelete() {
    this.context.executeAction(deleteAccount, {
      accountId: this.state.accountId
    });

    this.handleCloseDeleteDialog();
  },

  handleOpenDeleteDialog() {
    this.setState({ deleteDialogOpened: true });
  },

  handleCloseDeleteDialog() {
    this.setState({ deleteDialogOpened: false });
  },

  handleReverify() {
    this.context.executeAction(resendCreatePassword, {
      data: { username: this.state.selectedAccount.username }
    });

    this.handleCloseReverifyDialog();
  },

  handleOpenReverifyDialog() {
    this.setState({ reverifyDialogOpened: true });
  },

  handleCloseReverifyDialog() {
    this.setState({ reverifyDialogOpened: false });
  },

  render() {
    if (_.isEmpty(this.state.selectedAccount) && !this.isCreate()) return null;

    let {
      accountId,
      firstName,
      lastName,
      status,
      email,
      createdAt,
      assignedGroup,
      assignedCompanies,
      isError,
      isVerified
    } = this.state;

    return (
      <div className="account-profile">

        <AccountActionBar
          handleSave={this.handleSave}
          handleDiscard={this.handleDiscard}
          handleDelete={this.handleDelete}
          deleteDialogOpened={this.state.deleteDialogOpened}
          handleOpenDeleteDialog={this.handleOpenDeleteDialog}
          handleCloseDeleteDialog={this.handleCloseDeleteDialog}
          isEnabled={this.isValueChanged() && !isError}
          isCreate={this.isCreate()}
          accountId={accountId}
        />

        <div className="account-profile__container">
          <div class="panel callout radius">
            <h4 className="account-profile__header">
              {this.isCreate() ? CREATE_ACCOUNT_TITLE : EDIT_ACCOUNT_TITLE }
            </h4>

            <hr />

            <If condition={!this.isCreate()}>
              <AccountInfo
                isVerified={isVerified}
                firstName={firstName}
                lastName={lastName}
                createdAt={createdAt}
                assignedGroup={assignedGroup}
              />
            </If>

            <AccountForm
              ref="AccountForm"
              isVerified={isVerified}
              isCreate={this.isCreate()}
              accountId={accountId}
              firstName={firstName}
              lastName={lastName}
              email={email}
              assignedGroup={assignedGroup}
              assignedCompanies={assignedCompanies}
              handleErrorState={this.handleErrorState}
              handleFirstNameChange={this.handleFirstNameChange}
              handleLastNameChange={this.handleLastNameChange}
              handleEmailChange={this.handleEmailChange}
              handleGroupChange={this.handleGroupChange}
              handleCompanyChange={this.handleCompanyChange}
              handleSave={this.handleSave}
              reverifyDialogOpened={this.state.reverifyDialogOpened}
              handleReverify={this.handleReverify}
              handleOpenReverifyDialog={this.handleOpenReverifyDialog}
              handleCloseReverifyDialog={this.handleCloseReverifyDialog}
            />
          </div>
        </div>
      </div>
    );
  }
});
