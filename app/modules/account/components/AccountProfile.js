import { connectToStores } from 'fluxible-addons-react';
import React, { PropTypes, Component } from 'react';

import _ from 'lodash';
import { injectIntl } from 'react-intl';
import Joi from 'joi';
import { injectJoiValidation } from 'm800-user-locale/joi-validation';

import ApplicationStore from '../../../main/stores/ApplicationStore';
import AccountStore from '../stores/AccountStore';
import { MESSAGES } from './../constants/i18n';
import { ROLE_EDIT_STAGES } from '../constants/status';

import createAccount from '../actions/createAccount';
import updateAccount from '../actions/updateAccount';
import deleteAccount from '../actions/deleteAccount';
import fetchAccount from '../actions/fetchAccount';
import resendCreatePassword from '../actions/resendCreatePassword';

import AccountForm from './AccountForm';
import AccountActionBar from './AccountActionBar';
import AccountInfo from './AccountInfo';

class AccountProfile extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    currentCompany: PropTypes.object.isRequired,
    managingCompanies: PropTypes.array.isRequired,
    account: PropTypes.shape({
      lastName: PropTypes.string,
      firstName: PropTypes.string,
      email: PropTypes.string,
      createdAt: PropTypes.string,
      roles: PropTypes.array,
      affiliatedCompany: PropTypes.string,
      isVerified: PropTypes.bool,
    }),
    actionToken: PropTypes.number,
    mode: PropTypes.string.isRequired,
    errors: PropTypes.object,
    validate: PropTypes.func,
    isValid: PropTypes.func,
    handleValidation: PropTypes.func,
    getValidationMessages: PropTypes.func,
    clearValidations: PropTypes.func,
  }

  static contextTypes = {
    executeAction: PropTypes.func.isRequired,
    router: PropTypes.object.isRequired,
    params: PropTypes.shape({
      identity: PropTypes.string.isRequired,
      accountId: PropTypes.string,
    }),
    location: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    // default values for state
    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      deleteDialogOpened: false,
      selectedCompany: {},
      selectedRoles: [],
      currentRoles: {},
      operationToken: Math.random(),
      RoleEditStage: ROLE_EDIT_STAGES.addNewRole,
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
    this.handleRoleEditStageChanged = this.handleRoleEditStageChanged.bind(this);
    this.validateFirstName = this.validateFirstName.bind(this);
    this.validateLastName = this.validateLastName.bind(this);
    this.validateEmail = this.validateEmail.bind(this);
    this.handleDiscard = this.handleDiscard.bind(this);
    this.handleReverify = this.handleReverify.bind(this);
    this.handleEditRole = this.handleEditRole.bind(this);
    this.handleOpenReverifyDialog = this.handleOpenReverifyDialog.bind(this);
    this.handleCloseReverifyDialog = this.handleCloseReverifyDialog.bind(this);
    this.handleDeleteCompany = this.handleDeleteCompany.bind(this);
  }

  componentDidMount() {
    const { accountId, identity } = this.context.params;
    // fetch the account
    if (accountId) {
      this.context.executeAction(fetchAccount, { id: accountId, carrierId: identity });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { accountId, identity } = this.context.params;

    // callback from the previous action and redirect back to the account list page
    if (this.state.operationToken === _.get(nextProps.operationResult, 'token')) {
      // update the operation Token, since the token is already consumed
      this.state.operationToken = Math.random();
      this.redirect(_.get(nextProps.operationResult, 'redirection'));
      return;
    }

    // fetch account since the account id is different from the path
    if (nextProps.params.accountId && nextProps.params.accountId !== accountId) {
      this.context.executeAction(fetchAccount, { id: nextProps.params.accountId, carrierId: identity });
      return;
    }

    // no need update the state the when the account is the same
    if (this.props.account === nextProps.account) {
      return;
    }

    // update the account
    this.updateAccountState(nextProps);
  }

  getValidatorData() {
    const { firstName, lastName, email } = this.state;
    return {
      firstName,
      lastName,
      email,
    };
  }
  // it will redirect to the page according to the operation result
  redirect(path) {
    const { identity } = this.context.params;
    this.context.router.push(`/${identity}${path}`);
  }

  updateAccountState(props) {
    this.state.firstName = props.account.firstName;
    this.state.lastName = props.account.lastName;
    this.state.email = props.account.email;
    this.state.createdAt = props.account.createdAt;
    this.state.selectedRoles = [];
    this.state.selectedCompany = {};
    this.state.currentRoles = {};
    this.setState({ RoleEditStage: ROLE_EDIT_STAGES.addNewRole });
    // convert into current roles format in form of object
    if (props.account.roles) {
      _.each(props.account.roles, role => {
        this.state.currentRoles[role.company] = this.state.currentRoles[role.company] || [];
        this.state.currentRoles[role.company].push(role.id);
      });
    }
    props.clearValidations();
    this.state.operationToken = Math.random();
  }

  validatorTypes() {
    const { intl: { formatMessage } } = this.props;
    return {
      firstName: Joi.string().trim().max(30).required().label(formatMessage(MESSAGES.firstName)),
      lastName: Joi.string().trim().max(30).required().label(formatMessage(MESSAGES.lastName)),
      email: Joi.string().email().required().label(formatMessage(MESSAGES.email)),
    };
  }

  handleFirstNameChange(e) {
    e.preventDefault();
    this.setState({ firstName: e.target.value });
    if (this.props.errors.firstName) this.validateFirstName();
  }

  handleLastNameChange(e) {
    e.preventDefault();
    this.setState({ lastName: e.target.value });
    if (this.props.errors.lastName) this.validateLastName();
  }

  handleEmailChange(e) {
    e.preventDefault();
    this.setState({ email: e.target.value });
    if (this.props.errors.email) this.validateEmail();
  }

  handleEditRole(id) {
    this.handleSelectedCompanyChange(id);
    this.handleRoleEditStageChanged(ROLE_EDIT_STAGES.editRole);
  }

  handleDeleteCompany(id) {
    const roles = _.omit(this.state.currentRoles, id);
    this.setState({ currentRoles: roles });
    this.setState({ selectedRoles: [] });
    this.handleRoleEditStageChanged(ROLE_EDIT_STAGES.addNewRole);
  }

  handleRoleEditStageChanged(RoleEditStage) {
    this.setState({ RoleEditStage });
  }

  containErrors() {
    const {
      firstName, lastName, email,
    } = this.props.errors;

    return firstName || lastName || email;
  }

  validateField(fieldName, cb) {
    this.props.validate(fieldName, err => {
      // return the error when exist
      if (err[fieldName] && err[fieldName].length) {
        cb(err[fieldName]);
        return;
      }
      cb();
    });
  }

  validateFirstName() {
    this.props.validate('firstName');
  }

  validateLastName() {
    this.props.validate('lastName');
  }

  validateEmail() {
    this.props.validate('email');
  }

  handleSave(e) {
    e.preventDefault();
    const { params: { identity } } = this.context;
    this.props.validate(err => {
      if (err || this.containErrors()) {
        return;
      }
      let roles = [];
      _.each(this.state.currentRoles, role => {
        roles = roles.concat(role);
      });
      const data = {
        name: {
          firstName: this.state.firstName.trim().replace(/\s+/g, ' '),
          lastName: this.state.lastName.trim().replace(/\s+/g, ' '),
        },
        id: this.state.email,
        // either current affiliated id or current company id
        affiliatedCompany: this.props.account.affiliatedCompany || this.props.currentCompany.id,
        roles,
        carrierId: identity,
      };
      if (this.isCreate()) {
        this.context.executeAction(createAccount, { token: this.state.operationToken, ...data });
      } else {
        data.id = this.state.email;
        this.context.executeAction(updateAccount, { token: this.state.operationToken, ...data });
      }
    });
  }

  handleDiscard() {
    this.redirect('/account');
  }

  handleDelete() {
    const { params: { identity } } = this.context;
    this.context.executeAction(deleteAccount, {
      carrierId: identity,
      token: this.state.operationToken,
      id: this.state.email });
    this.handleCloseDeleteDialog();
  }

  handleOpenDeleteDialog() {
    this.setState({ deleteDialogOpened: true });
  }

  handleCloseDeleteDialog() {
    this.setState({ deleteDialogOpened: false });
  }

  handleReverify() {
    const { params: { identity } } = this.context;
    this.context.executeAction(resendCreatePassword, {
      id: this.state.email,
      carrierId: identity,
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
    if (!item) {
      return;
    }
    const currentCompany = _.find(
    this.props.managingCompanies, company => company.id === item);

    this.setState({
      currentRoles: this.state.currentRoles,
      selectedCompany: currentCompany,
      selectedRoles: this.state.currentRoles[item] || [],
    });
  }

  handleSelectedRoleChange(e) {
    let selectedRoles = this.state.selectedRoles;
    if (e.target.checked) {
      selectedRoles = this.state.selectedRoles.concat(e.target.value);
    } else {
      selectedRoles = this.state.selectedRoles;
      const index = selectedRoles.indexOf(e.target.value);
      selectedRoles.splice(index, 1);
    }
    this.state.currentRoles[this.state.selectedCompany.id] = selectedRoles;
    this.setState({ selectedRoles });
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
      selectedCompany,
      selectedRoles,
      currentRoles,
      RoleEditStage,
    } = this.state;

    const {
       managingCompanies,
       account,
       errors,
     } = this.props;
    return (
      <AccountForm
        ref="AccountForm"
        accountId={email}
        firstName={firstName}
        lastName={lastName}
        email={email}
        currentRoles={currentRoles}
        managingCompanies={managingCompanies}
        selectedCompany={selectedCompany}
        selectedRoles={selectedRoles}
        firstNameError={errors.firstName}
        lastNameError={errors.lastName}
        emailError={errors.email}
        isCreate={this.isCreate()}
        isVerified={account.isVerified}
        RoleEditStage={RoleEditStage}
        validateFirstName={this.validateFirstName}
        validateLastName={this.validateLastName}
        validateEmail={this.validateEmail}
        handleFirstNameChange={this.handleFirstNameChange}
        handleLastNameChange={this.handleLastNameChange}
        handleEmailChange={this.handleEmailChange}
        handleSelectedCompanyChange={this.handleSelectedCompanyChange}
        handleSelectedRoleChange={this.handleSelectedRoleChange}
        handleRoleEditStageChanged={this.handleRoleEditStageChanged}
        handleSave={this.handleSave}
        handleEditRole={this.handleEditRole}
        reverifyDialogOpened={this.state.reverifyDialogOpened}
        handleReverify={this.handleReverify}
        handleOpenReverifyDialog={this.handleOpenReverifyDialog}
        handleCloseReverifyDialog={this.handleCloseReverifyDialog}
        handleDeleteCompany={this.handleDeleteCompany}
      />
    );
  }

  renderInfoContainer() {
    const { formatMessage } = this.props.intl;
    return (
      <div className="account-profile__container">
        <div className="panel callout radius">
          <h4 className="account-profile__header">
            {
              formatMessage(this.isCreate() ?
              MESSAGES.createNewAccount : MESSAGES.accountInformation)
            }
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
    const { account } = this.props;
    // not render the form when it is in edit mode and account is not fetched
    if (!this.isCreate() && !account.email) {
      return null;
    }
    return (
      <div className="account-profile">
        {this.renderActionBar()}
        {this.renderInfoContainer()}
      </div>
    );
  }
}

AccountProfile = injectIntl(injectJoiValidation(AccountProfile));
AccountProfile = connectToStores(
  AccountProfile,
  [AccountStore, ApplicationStore],
 (context, props) => {
   // read from the props to see if it is create or edit
   const { accountId } = props.params;
   const defaultProps = {};
   if (accountId) {
     defaultProps.account = context.getStore(AccountStore).getSelectedAccount();
     defaultProps.mode = 'edit';
   } else {
     defaultProps.account = context.getStore(AccountStore).getNewAccount();
     defaultProps.mode = 'create';
   }
   defaultProps.currentCompany = context.getStore(ApplicationStore).getCurrentCompany();
   defaultProps.managingCompanies = context.getStore(AccountStore).getManagingCompanies();
   defaultProps.operationResult = context.getStore(AccountStore).getOperationResult();
   return defaultProps;
 });

export default AccountProfile;
