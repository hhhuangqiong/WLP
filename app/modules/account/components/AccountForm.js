import React, { PropTypes, Component } from 'react';
import classnames from 'classnames';
import { injectIntl, intlShape } from 'react-intl';
import _ from 'lodash';
import FormField from '../../../main/components/FormField';
import ConfirmationDialog from '../../../main/components/ConfirmationDialog';
import { MESSAGES } from './../constants/i18n';
import { ROLE_EDIT_STAGES } from './../constants/status';
import AddNewRole from './AddNewRole';
import CompanySelectedList from './CompanySelectedList';
import RoleSelectedList from './RoleSelectedList';

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
    // This is the process state for assigning roles
    // possible string will lbe
    // addNewRoles, selectCompany, selectRole, editRole
    RoleEditStage: PropTypes.oneOf(_.values(ROLE_EDIT_STAGES)).isRequired,
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
  };

  onSubmit = (e) => {
    if (e.which === 13) {
      e.preventDefault();
      this.props.handleSave(e);
    }
  }

  render() {
    const {
      firstName,
      lastName,
      email,
      managingCompanies,
      selectedCompany,
      handleSelectedCompanyChange,
      selectedRoles,
      currentRoles,
      handleSelectedRoleChange,
      handleRoleEditStageChanged,
      handleEditRole,
      handleDeleteCompany,
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
          {(() => {
            switch (this.props.RoleEditStage) {
              case ROLE_EDIT_STAGES.addNewRole:
                return (
                  <AddNewRole
                    currentRoles={currentRoles}
                    managingCompanies={managingCompanies}
                    handleRoleEditStageChanged={handleRoleEditStageChanged}
                    handleEditRole={handleEditRole}
                    handleDeleteCompany={handleDeleteCompany}
                  />
                );
              case ROLE_EDIT_STAGES.selectCompany:
                return (
                  <CompanySelectedList
                    managingCompanies={managingCompanies}
                    handleSelectedCompanyChange={handleSelectedCompanyChange}
                    selectedCompany={selectedCompany}
                    handleRoleEditStageChanged={handleRoleEditStageChanged}
                  />
                );
              case ROLE_EDIT_STAGES.selectRole:
                return (
                  <RoleSelectedList
                    selectedCompany={selectedCompany}
                    selectedRoles={selectedRoles}
                    handleRoleEditStageChanged={handleRoleEditStageChanged}
                    handleSelectedRoleChange={handleSelectedRoleChange}
                    editRole={false}
                  />
                );
              case ROLE_EDIT_STAGES.editRole:
                return (
                  <RoleSelectedList
                    selectedCompany={selectedCompany}
                    selectedRoles={selectedRoles}
                    handleRoleEditStageChanged={handleRoleEditStageChanged}
                    handleSelectedRoleChange={handleSelectedRoleChange}
                    handleDeleteCompany={handleDeleteCompany}
                    editRole
                  />
                );
              default: return null;
            }
          })()}
        </FormField>

      </form>
    );
  }
}

export default injectIntl(AccountForm);
