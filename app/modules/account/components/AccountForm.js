import React, { PropTypes, Component } from 'react';
import classnames from 'classnames';
import { injectIntl, intlShape } from 'react-intl';
import _ from 'lodash';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import FormField from '../../../main/components/FormField';
import ConfirmationDialog from '../../../main/components/ConfirmationDialog';
import { MESSAGES } from './../constants/i18n';
import { ROLE_EDIT_STAGES, FORWARD, BACKWARD } from './../constants/roleEditing';
import AddNewRole from './AddNewRole';
import CompanySelectedList from './CompanySelectedList';
import RoleSelectedList from './RoleSelectedList';

const ANIMATION_TIME = 500; // ms
const ENTER_CODE = 13;

class AccountForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    isVerified: PropTypes.bool.isRequired,
    isCreate: PropTypes.bool.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    managingCompanies: PropTypes.array.isRequired,
    selectedCompany: PropTypes.object.isRequired,
    selectedRoles: PropTypes.array.isRequired,
    currentRoles: PropTypes.object,
    firstNameError: PropTypes.array,
    lastNameError: PropTypes.array,
    emailError: PropTypes.array,
    rolesError: PropTypes.array,
    // This is the process state for assigning roles
    // possible string will lbe
    // addNewRoles, selectCompany, selectRole, editRole
    roleEditStage: PropTypes.oneOf(_.values(ROLE_EDIT_STAGES)).isRequired,
    validateFirstName: PropTypes.func.isRequired,
    validateLastName: PropTypes.func.isRequired,
    validateEmail: PropTypes.func.isRequired,
    handleFirstNameChange: PropTypes.func.isRequired,
    handleLastNameChange: PropTypes.func.isRequired,
    handleEmailChange: PropTypes.func.isRequired,
    handleSelectedCompanyChange: PropTypes.func.isRequired,
    handleSelectedRoleChange: PropTypes.func.isRequired,
    handleRoleEditStageChanged: PropTypes.func.isRequired,
    handleSave: PropTypes.func.isRequired,
    reverifyDialogOpened: PropTypes.bool,
    handleReverify: PropTypes.func.isRequired,
    handleOpenReverifyDialog: PropTypes.func.isRequired,
    handleCloseReverifyDialog: PropTypes.func.isRequired,
    handleDeleteCompany: PropTypes.func.isRequired,
    handleEditRole: PropTypes.func.isRequired,
    handleSaveCompany: PropTypes.func.isRequired,
    previousRoleEditStage: PropTypes.oneOf(_.values(ROLE_EDIT_STAGES)).isRequired,
  };

  onSubmit = (e) => {
    if (e.which === ENTER_CODE) {
      e.preventDefault();
      this.props.handleSave(e);
    }
  }

  renderErrorMessages = (errorMessages) => {
    if (!errorMessages) {
      return null;
    }
    return (
      <div className="error">
        {errorMessages.map((errorMsg, index) => (
          <div key={index}>{errorMsg}</div>
        ))}
      </div>
    );
  }

  renderEditRoleList = (status) => {
    const {
      selectedCompany,
      currentRoles,
      previousRoleEditStage,
      roleEditStage,
      ...restProps,
    } = this.props;

    let animationDirection;
    if (previousRoleEditStage === ROLE_EDIT_STAGES.selectRole
      && roleEditStage === ROLE_EDIT_STAGES.selectCompany) {
      animationDirection = BACKWARD;
    } else {
      animationDirection = FORWARD;
    }

    return (
      <div className="account-form__assigned-role select-company">
        <ReactCSSTransitionGroup
          transitionName = {animationDirection}
          transitionEnter = {ANIMATION_TIME}
          transitionLeaveTimeout = {ANIMATION_TIME}
        >
        {(() => {
          switch (status) {
            case ROLE_EDIT_STAGES.selectCompany:
              return (
                <CompanySelectedList
                  key={ROLE_EDIT_STAGES.selectCompany}
                  selectedCompany={selectedCompany}
                  {...restProps}
                />
              );
            case ROLE_EDIT_STAGES.selectRole:
              return (
                <RoleSelectedList
                  key={ROLE_EDIT_STAGES.selectRole}
                  selectedCompany={selectedCompany}
                  editRole={_.includes(_.keys(currentRoles), selectedCompany.id)}
                  {...restProps}
                />
              );
            default: return null;
          }
        })()}
        </ReactCSSTransitionGroup>
      </div>
    );
  }

  render() {
    const {
      firstName,
      lastName,
      email,
      rolesError,
      ...restProps,
    } = this.props;

    const { formatMessage } = this.props.intl;

    return (
      <form className="account-form" onSubmit={this.props.handleSave}>
        <ConfirmationDialog
          isOpen={this.props.reverifyDialogOpened}
          onConfirm={this.props.handleReverify}
          onCancel={this.props.handleCloseReverifyDialog}
          confirmLabel={formatMessage(MESSAGES.reverify)}
          dialogMessage={formatMessage(MESSAGES.reverifyDialogMessage, { name: this.props.email })}
          dialogHeader={formatMessage(MESSAGES.reverifyDialogHeader)}
        />

        <FormField label={formatMessage(MESSAGES.userName)}>
          <div className="row">
            <div className="large-12 columns">
              <input
                ref="firstName"
                name="firstName"
                className={classnames('radius', { error: this.props.firstNameError })}
                type="text"
                placeholder={formatMessage(MESSAGES.firstName)}
                value={firstName}
                onBlur={this.props.validateFirstName}
                onChange={this.props.handleFirstNameChange}
                onKeyPress={this.onSubmit}
              />
              <label className={classnames({ hide: !this.props.firstNameError })}>
                {this.props.firstNameError}
              </label>
            </div>

            <div className="large-12 columns">
              <input
                ref="lastName"
                name="lastName"
                className={classnames('radius', { error: this.props.lastNameError })}
                type="text"
                placeholder={formatMessage(MESSAGES.lastName)}
                value={lastName}
                onBlur={this.props.validateLastName}
                onChange={this.props.handleLastNameChange}
                onKeyPress={this.onSubmit}
              />
              <label className={classnames({ hide: !this.props.lastNameError })}>
                {this.props.lastNameError}
              </label>
            </div>
          </div>
        </FormField>

        <FormField label={formatMessage(MESSAGES.email)}>
          <If condition={!this.props.isVerified && !this.props.isCreate}>
            <span
              className="account-reverify-email"
              onClick={this.props.handleOpenReverifyDialog}
            >Reverify</span>
          </If>
          <input
            ref="email"
            name="email"
            placeholder={formatMessage(MESSAGES.email)}
            className={classnames('radius', { error: this.props.emailError })}
            type="email"
            value={email}
            disabled={!this.props.isCreate && !!this.props.email}
            onBlur={this.props.validateEmail}
            onChange={this.props.handleEmailChange}
            onKeyPress={this.onSubmit}
          />
          <label className={classnames({ hide: !this.props.emailError })}>
            {this.props.emailError}
          </label>
        </FormField>

        <FormField label={formatMessage(MESSAGES.assignedRole)}>
          {
            this.props.roleEditStage === ROLE_EDIT_STAGES.addNewRole ?
            <AddNewRole
              key={ROLE_EDIT_STAGES.addNewRole}
              {...restProps}
            /> : this.renderEditRoleList(this.props.roleEditStage)
          }
          {this.renderErrorMessages(rolesError)}
        </FormField>
      </form>
    );
  }
}

export default injectIntl(AccountForm);
