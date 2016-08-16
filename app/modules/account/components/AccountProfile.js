import { connectToStores } from 'fluxible-addons-react';
import React, { PropTypes, Component } from 'react';

import _ from 'lodash';
import { injectIntl } from 'react-intl';
import Joi from 'joi';

import ApplicationStore from '../../../main/stores/ApplicationStore';
import AccountStore from '../stores/AccountStore';
import { MESSAGES } from './../constants/i18n';

import createAccount from '../actions/createAccount';
import updateAccount from '../actions/updateAccount';
import deleteAccount from '../actions/deleteAccount';
import fetchAccount from '../actions/fetchAccount';
import redirectToAccountHome from '../actions/redirectToAccountHome';
import redirectedToAccountHome from '../actions/redirectedToAccountHome';
import resendCreatePassword from '../actions/resendCreatePassword';

import AccountForm from './AccountForm';
import AccountActionBar from './AccountActionBar';
import AccountInfo from './AccountInfo';

const NAME_VALIDATION = Joi.string().min(1).max(30).required().label('Name');
const EMAIL_VALIDATION = Joi.string().email().required().label('Email');

class AccountProfile extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    currentCompany: PropTypes.object,
    managingCompanies: PropTypes.array.isRequired,
    account: PropTypes.object,
    mode: PropTypes.string.isRequired,
  }

  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    router: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    // default values for state
    this.state = {
      deleteDialogOpened: false,
      selectedCompany: '',
      selectedRoles: [],
      currentRoles: {},
    };
    this.handleFirstNameChange = this.handleFirstNameChange.bind(this);
    this.handleLastNameChange = this.handleLastNameChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleOpenDeleteDialog = this.handleOpenDeleteDialog.bind(this);
    this.handleCloseDeleteDialog = this.handleCloseDeleteDialog.bind(this);
    this.handleSelectedCompanyChange = this.handleSelectedCompanyChange.bind(this);
    this.handleSelectedRoleChange = this.handleSelectedRoleChange.bind(this);
    this.validateFirstName = this.validateFirstName.bind(this);
    this.validateLastName = this.validateLastName.bind(this);
    this.validateEmail = this.validateEmail.bind(this);
    this.handleDiscard = this.handleDiscard.bind(this);
  }

  componentDidMount() {
    const { accountId } = this.props.params;
    // fetch the account
    if (accountId) {
      this.context.executeAction(fetchAccount, { id: accountId });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { accountId, identity } = this.props.params;
    if (nextProps.redirectToAccountHome) {
      this.context.router.push(`/${identity}/account`);
      this.context.executeAction(redirectedToAccountHome);
      return;
    }
    if (nextProps.params.accountId && nextProps.params.accountId !== accountId) {
      this.context.executeAction(fetchAccount, { id: nextProps.params.accountId });
    }
    this.updateState(nextProps);
  }

  updateState(props) {
    this.state.firstName = props.account.firstName;
    this.state.lastName = props.account.lastName;
    this.state.email = props.account.email;
    this.state.createdAt = props.account.createdAt;
    // convert into current roles format in form of object
    if (props.account.roles) {
      _.each(props.account.roles, role => {
        this.state.currentRoles[role.company] = this.state.currentRoles[role.company] || [];
        this.state.currentRoles[role.company].push(role._id);
      });
    }
  }

  handleFirstNameChange(e) {
    e.preventDefault();
    if (this.state.firstNameError) this.validateFirstName(e);
    this.setState({ firstName: e.target.value });
  }

  handleLastNameChange(e) {
    e.preventDefault();
    if (this.state.lastNameError) this.validateLastName(e);
    this.setState({ lastName: e.target.value });
  }

  handleEmailChange(e) {
    e.preventDefault();
    if (this.state.emailError) this.validateEmail(e);
    this.setState({ email: e.target.value });
  }

  containErrors() {
    const {
      firstNameError, lastNameError, emailError,
    } = this.state;

    return firstNameError || lastNameError || emailError;
  }

  validateFirstName(e) {
    e.preventDefault();
    const result = NAME_VALIDATION.validate(this.state.firstName);
    this.setState({ firstNameError: result.error ? result.error.message : null });
  }

  validateLastName(e) {
    e.preventDefault();
    const result = NAME_VALIDATION.validate(this.state.lastName);
    this.setState({ lastNameError: result.error ? result.error.message : null });
  }

  validateEmail(e) {
    e.preventDefault();
    const result = EMAIL_VALIDATION.validate(this.state.email);
    this.setState({ emailError: result.error ? result.error.message : null });
  }

  handleSave(e) {
    e.preventDefault();
    this.validateFirstName(e);
    this.validateLastName(e);
    this.validateEmail(e);

    if (this.containErrors()) return;
    let roles = [];
    _.each(this.state.currentRoles, role => {
      roles = roles.concat(role);
    });
    const data = {
      name: {
        firstName: this.state.firstName,
        lastName: this.state.lastName,
      },
      id: this.state.email,
      // either current affiliated id or current company id
      affiliatedCompany: this.props.account.affiliatedCompany || this.props.currentCompany.id,
      roles,
    };
    if (this.isCreate()) {
      this.context.executeAction(createAccount, { data, companyId: this.props.currentCompany.id });
    } else {
      data.id = this.state.email;
      // missing roles after update
      data.removeRoles = _.difference(this.props.account.roles, roles);
      // extra roles after update
      data.roles = _.difference(roles, this.props.account.roles);
      this.context.executeAction(updateAccount, { data, companyId: this.props.currentCompany.id });
    }
  }

  handleDiscard() {
    this.context.executeAction(redirectToAccountHome);
  }

  handleDelete() {
    this.context.executeAction(deleteAccount, {
      accountId: this.state.email,
      companyId: this.props.currentCompany.id,
    });

    this.handleCloseDeleteDialog();
  }

  handleOpenDeleteDialog() {
    this.setState({ deleteDialogOpened: true });
  }

  handleCloseDeleteDialog() {
    this.setState({ deleteDialogOpened: false });
  }

  handleReverify() {
    this.context.executeAction(resendCreatePassword, {
      data: { username: this.state.email },
    });

    this.handleCloseReverifyDialog();
  }

  handleOpenReverifyDialog() {
    this.setState({ reverifyDialogOpened: true });
  }

  handleCloseReverifyDialog() {
    this.setState({ reverifyDialogOpened: false });
  }

  handleSelectedCompanyChange(item) {
    if (!item.value) {
      return;
    }
    this.state.currentRoles[this.state.selectedCompany] = this.state.selectedRoles;
    this.setState({
      currentRoles: this.state.currentRoles,
      selectedCompany: item.value,
      selectedRoles: this.state.currentRoles[item.value] || [],
    });
  }

  handleSelectedRoleChange(items) {
    const selectedValues = _.map(items, item => item.value);
    this.setState({ selectedRoles: selectedValues });
  }

  isCreate() {
    return this.props.mode === 'create';
  }

  renderActionBar() {
    return (
      <AccountActionBar
        handleSave={this.handleSave}
        handleDiscard={this.handleDiscard}
        handleDelete={this.handleDelete}
        deleteDialogOpened={this.state.deleteDialogOpened}
        handleOpenDeleteDialog={this.handleOpenDeleteDialog}
        handleCloseDeleteDialog={this.handleCloseDeleteDialog}
        isEnabled={!this.containErrors()}
        isCreate={this.isCreate()}
        accountId={this.props.account.email}
      />
    );
  }

  renderAccountInfo() {
    const {
      firstName,
      lastName,
      createdAt,
    } = this.state;
    return (
      <AccountInfo
        isVerified={this.props.account.isVerified}
        firstName={firstName}
        lastName={lastName}
        createdAt={createdAt}
      />
    );
  }

  renderAccountForm() {
    const {
      email,
      firstName,
      lastName,
      firstNameError,
      lastNameError,
      emailError,
      selectedCompany,
      selectedRoles,
    } = this.state;

    const {
       managingCompanies,
     } = this.props;
    return (
      <AccountForm
        ref="AccountForm"
        accountId={email}
        firstName={firstName}
        lastName={lastName}
        email={email}
        managingCompanies={managingCompanies}
        selectedCompany={selectedCompany}
        selectedRoles={selectedRoles}
        firstNameError={firstNameError}
        lastNameError={lastNameError}
        emailError={emailError}
        isCreate={this.isCreate()}
        validateFirstName={this.validateFirstName}
        validateLastName={this.validateLastName}
        validateEmail={this.validateEmail}
        handleFirstNameChange={this.handleFirstNameChange}
        handleLastNameChange={this.handleLastNameChange}
        handleEmailChange={this.handleEmailChange}
        handleSelectedCompanyChange={this.handleSelectedCompanyChange}
        handleSelectedRoleChange={this.handleSelectedRoleChange}
        handleSave={this.handleSave}
        reverifyDialogOpened={this.state.reverifyDialogOpened}
        handleReverify={this.handleReverify}
        handleOpenReverifyDialog={this.handleOpenReverifyDialog}
        handleCloseReverifyDialog={this.handleCloseReverifyDialog}
      />
    );
  }

  renderInfoContainer() {
    const { formatMessage } = this.props.intl;
    return (
      <div className="account-profile__container">
        <div className="panel callout radius">
          <h4 className="account-profile__header">
            { formatMessage(this.isCreate() ? MESSAGES.createNewUser : MESSAGES.accountInformation)}
          </h4>
          <hr />
          <If condition={!this.isCreate()}>
            {this.renderAccountInfo()}
          </If>
          {this.renderAccountForm()}
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="account-profile">
        {this.renderActionBar()}
        {this.renderInfoContainer()}
      </div>
    );
  }
}

AccountProfile = injectIntl(AccountProfile);
AccountProfile = connectToStores(
  AccountProfile,
  [AccountStore, ApplicationStore],
 (context, props) => {
   // read from the props to see if it is create or edit
   const { accountId } = props.params;
   const defaultState = {};
   if (accountId) {
     defaultState.account = context.getStore(AccountStore).getSelectedAccount();
     defaultState.mode = 'edit';
   } else {
     defaultState.account = context.getStore(AccountStore).getNewAccount();
     defaultState.mode = 'create';
   }
   defaultState.currentCompany = context.getStore(ApplicationStore).getCurrentCompany();
   defaultState.managingCompanies = context.getStore(AccountStore).getManagingCompanies();
   defaultState.redirectToAccountHome = context.getStore(AccountStore).getRedirectToHome();
   return defaultState;
 });

export default AccountProfile;
