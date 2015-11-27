import _ from 'lodash';
import React, { PropTypes } from 'react';
import Joi from 'joi';
import { concurrent } from 'contra';

import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import AuthMixin from '../../../utils/AuthMixin';

import ApplicationStore from '../../../main/stores/ApplicationStore';
import AccountStore from '../stores/AccountStore';
import CompanyStore from '../../company/stores/CompanyStore';

import fetchCompanies from '../../company/actions/fetchCompanies';
import fetchCarrierManagingCompanies from '../actions/fetchCarrierManagingCompanies';
import fetchAccounts from '../actions/fetchAccounts';
import createAccount from '../actions/createAccount';
import updateAccount from '../actions/updateAccount';
import deleteAccount from '../actions/deleteAccount';
import resendCreatePassword from '../actions/resendCreatePassword';

import AccountForm from './AccountForm';
import AccountActionBar from './AccountActionBar';
import AccountInfo from './AccountInfo';

const DELETE_ACCOUNT_MSG = 'Are you sure to delete this account?';
const NEW_ACCOUNT_ROUTE_NAME = 'account-create';
const EDIT_ACCOUNT_TITLE = 'ACCOUNT INFORMATION';
const CREATE_ACCOUNT_TITLE = 'CREATE ACCOUNT';
const CHANGE_PASSWORD_TOKEN = 'change-password';
const NAME_VALIDATION = Joi.string().min(1).max(30).required().label('Name');
const EMAIL_VALIDATION = Joi.string().email().required().label('Email');

export default React.createClass({
  displayName: 'AccountProfile',

  mixins: [FluxibleMixin, AuthMixin],

  contextTypes: {
    executeAction: PropTypes.func.isRequired,
    router: PropTypes.func.isRequired
  },

  statics: {
    storeListeners: [ApplicationStore, AccountStore]
  },

  getInitialState() {
    return this.getStateFromStores();
  },

  onChange() {
    this.setState(this.getStateFromStores());
  },

  componentDidMount() {
    let params = this.context.router.getCurrentParams();
    this.context.executeAction(fetchCarrierManagingCompanies, { carrierId: params.identity });
  },

  getStateFromStores() {
    let stateFromStores = {};

    let { accountId } = this.context.router.getCurrentParams();

    if (this.isCreate()) {
      stateFromStores = this.getStore(AccountStore).getNewAccount();
    } else if (accountId) {
      stateFromStores = this.getStore(AccountStore).getAccountByAccountId(accountId);
    }

    let carrierManagingCompanies = this.getStore(AccountStore).getCarrierManagingCompanies();
    let currentCompany = this.getStore(ApplicationStore).getCurrentCompany();

    if (this.isCreate() && currentCompany) {
      var affiliatedCompany = currentCompany._id;
    }

    return _.merge(stateFromStores, { carrierManagingCompanies, currentCompany, affiliatedCompany });
  },

  isCreate() {
    let currentRoute = _.last(this.context.router.getCurrentRoutes());
    return currentRoute.name === NEW_ACCOUNT_ROUTE_NAME;
  },

  handleFirstNameChange(e) {
    e.preventDefault();
    if (this.state.firstNameError) this.validateFirstName(e);
    this.setState({ firstName: e.target.value });
  },

  handleLastNameChange(e) {
    e.preventDefault();
    if (this.state.lastNameError) this.validateLastName(e);
    this.setState({ lastName: e.target.value });
  },

  handleEmailChange(e) {
    e.preventDefault();
    if (this.state.emailError) this.validateEmail(e);
    this.setState({ email: e.target.value });
  },

  handleGroupChange(assignedGroup) {
    this.setState({ assignedGroup });
  },

  handleCompanyChange(companyId) {
    let { carrierManagingCompanies } = this.state;

    if (_.isEmpty(carrierManagingCompanies)) return;

    let selectedCompany = carrierManagingCompanies.find(company => company._id === companyId);

    if (!selectedCompany) return;

    this.setState({ affiliatedCompany: selectedCompany._id });
  },

  containErrors() {
    let {
      firstNameError, lastNameError, emailError
    } = this.state;

    return firstNameError || lastNameError || emailError;
  },

  validateFirstName(e) {
    e.preventDefault();
    let result = NAME_VALIDATION.validate(this.state.firstName);
    this.setState({ firstNameError: result.error ? result.error.message : null });
  },

  validateLastName(e) {
    e.preventDefault();
    let result = NAME_VALIDATION.validate(this.state.lastName);
    this.setState({ lastNameError: result.error ? result.error.message : null });
  },

  validateEmail(e) {
    e.preventDefault();
    let result = EMAIL_VALIDATION.validate(this.state.email);
    this.setState({ emailError: result.error ? result.error.message : null });
  },

  handleSave(e) {
    e.preventDefault();

    this.validateFirstName(e);
    this.validateLastName(e);
    this.validateEmail(e);

    if (this.containErrors()) return;

    let data = {
      name: {
        first: this.state.firstName,
        last: this.state.lastName
      },
      username: this.state.email,
      assignedGroup: this.state.assignedGroup,
      assignedCompanies: this.state.assignedCompanies,
      affiliatedCompany: this.state.affiliatedCompany
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
    let params = this.context.router.getCurrentParams();

    this.context.executeAction(deleteAccount, {
      accountId: this.state.accountId,
      carrierId: params.identity
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

  handleAssignedCompanyChange(e) {
    let { id, checked } = e.target;
    let { assignedCompanies } = this.state;

    assignedCompanies = assignedCompanies.filter(companyId => companyId !== id).slice();

    if (checked) {
      assignedCompanies.push(id);
      assignedCompanies = assignedCompanies.slice();
    }

    this.setState({ assignedCompanies });
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
      affiliatedCompany,
      currentCompany,
      isVerified,
      carrierManagingCompanies
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
          isEnabled={!this.containErrors()}
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
              carrierManagingCompanies={carrierManagingCompanies}
              accountId={accountId}
              firstName={firstName}
              lastName={lastName}
              email={email}
              affiliatedCompany={affiliatedCompany}
              currentCompany={currentCompany}
              firstNameError={this.state.firstNameError}
              lastNameError={this.state.lastNameError}
              emailError={this.state.emailError}
              validateFirstName={this.validateFirstName}
              validateLastName={this.validateLastName}
              validateEmail={this.validateEmail}
              assignedGroup={assignedGroup}
              assignedCompanies={assignedCompanies}
              handleFirstNameChange={this.handleFirstNameChange}
              handleLastNameChange={this.handleLastNameChange}
              handleEmailChange={this.handleEmailChange}
              handleGroupChange={this.handleGroupChange}
              handleCompanyChange={this.handleCompanyChange}
              handleAssignedCompanyChange={this.handleAssignedCompanyChange}
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
