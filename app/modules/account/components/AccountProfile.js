import _ from 'lodash';
import React, { PropTypes } from 'react';
import Joi from 'joi';

import { FluxibleMixin } from 'fluxible-addons-react';

import ApplicationStore from '../../../main/stores/ApplicationStore';
import AccountStore from '../stores/AccountStore';

import fetchCarrierManagingCompanies from '../actions/fetchCarrierManagingCompanies';
import createAccount from '../actions/createAccount';
import updateAccount from '../actions/updateAccount';
import deleteAccount from '../actions/deleteAccount';
import resendCreatePassword from '../actions/resendCreatePassword';

import AccountForm from './AccountForm';
import AccountActionBar from './AccountActionBar';
import AccountInfo from './AccountInfo';

const NEW_ACCOUNT_ROUTE_NAME = 'account-create';
const EDIT_ACCOUNT_TITLE = 'ACCOUNT INFORMATION';
const CREATE_ACCOUNT_TITLE = 'CREATE ACCOUNT';
const NAME_VALIDATION = Joi.string().min(1).max(30).required().label('Name');
const EMAIL_VALIDATION = Joi.string().email().required().label('Email');

export default React.createClass({
  displayName: 'AccountProfile',

  contextTypes: {
    executeAction: PropTypes.func.isRequired,
    router: PropTypes.func.isRequired,
  },

  mixins: [FluxibleMixin],

  statics: {
    storeListeners: [ApplicationStore, AccountStore],
  },

  getInitialState() {
    return this.getStateFromStores();
  },

  componentDidMount() {
    const params = this.context.router.getCurrentParams();
    this.context.executeAction(fetchCarrierManagingCompanies, { carrierId: params.identity });
  },

  onChange() {
    this.setState(this.getStateFromStores());
  },

  getStateFromStores() {
    let stateFromStores = {};

    const { accountId } = this.context.router.getCurrentParams();

    if (this.isCreate()) {
      stateFromStores = this.getStore(AccountStore).getNewAccount();
    } else if (accountId) {
      stateFromStores = this.getStore(AccountStore).getAccountByAccountId(accountId);
    }

    const carrierManagingCompanies = this.getStore(AccountStore).getCarrierManagingCompanies();
    const currentCompany = this.getStore(ApplicationStore).getCurrentCompany();

    if (this.isCreate() && currentCompany) {
      var affiliatedCompany = currentCompany._id;
    }

    return _.merge(stateFromStores, { carrierManagingCompanies, currentCompany, affiliatedCompany });
  },

  isCreate() {
    const currentRoute = _.last(this.context.router.getCurrentRoutes());
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
    const { carrierManagingCompanies } = this.state;

    if (_.isEmpty(carrierManagingCompanies)) return;

    const selectedCompany = carrierManagingCompanies.find(company => company._id === companyId);

    if (!selectedCompany) return;

    this.setState({ affiliatedCompany: selectedCompany._id });
  },

  containErrors() {
    const {
      firstNameError, lastNameError, emailError,
    } = this.state;

    return firstNameError || lastNameError || emailError;
  },

  validateFirstName(e) {
    e.preventDefault();
    const result = NAME_VALIDATION.validate(this.state.firstName);
    this.setState({ firstNameError: result.error ? result.error.message : null });
  },

  validateLastName(e) {
    e.preventDefault();
    const result = NAME_VALIDATION.validate(this.state.lastName);
    this.setState({ lastNameError: result.error ? result.error.message : null });
  },

  validateEmail(e) {
    e.preventDefault();
    const result = EMAIL_VALIDATION.validate(this.state.email);
    this.setState({ emailError: result.error ? result.error.message : null });
  },

  handleSave(e) {
    e.preventDefault();

    this.validateFirstName(e);
    this.validateLastName(e);
    this.validateEmail(e);

    if (this.containErrors()) return;

    const data = {
      name: {
        first: this.state.firstName,
        last: this.state.lastName,
      },
      username: this.state.email,
      assignedGroup: this.state.assignedGroup,
      assignedCompanies: this.state.assignedCompanies,
      affiliatedCompany: this.state.affiliatedCompany,
    };

    if (this.isCreate()) {
      this.context.executeAction(createAccount, { data });
    } else {
      data.userId = this.state.accountId;
      this.context.executeAction(updateAccount, { data });
    }
  },

  isValueChanged() {
    const {
      firstName,
      lastName,
      email,
    } = this.state;

    return firstName.length && lastName.length && email.length;
  },

  handleDiscard() {
    if (!this.isValueChanged()) return;
    this.setState(this.getStateFromStores());
  },

  handleDelete() {
    const params = this.context.router.getCurrentParams();

    this.context.executeAction(deleteAccount, {
      accountId: this.state.accountId,
      carrierId: params.identity,
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
      data: { username: this.state.selectedAccount.username },
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
    const { id, checked } = e.target;
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

    const {
      accountId,
      firstName,
      lastName,
      email,
      createdAt,
      assignedGroup,
      assignedCompanies,
      affiliatedCompany,
      currentCompany,
      isVerified,
      carrierManagingCompanies,
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
          <div className="panel callout radius">
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
  },
});
