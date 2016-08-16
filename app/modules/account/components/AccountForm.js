import React, { PropTypes, Component } from 'react';
import Select from 'react-select';
import classnames from 'classnames';
import _ from 'lodash';
import { injectIntl, intlShape } from 'react-intl';

import FormField from '../../../main/components/FormField';
import ConfirmationDialog from '../../../main/components/ConfirmationDialog';
import { MESSAGES } from './../constants/i18n';

class AccountForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    isVerified: PropTypes.bool.isRequired,
    isCreate: PropTypes.bool.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    managingCompanies: PropTypes.array.isRequired,
    selectedCompany: PropTypes.string.isRequired,
    selectedRoles: PropTypes.array.isRequired,
    firstNameError: PropTypes.func,
    lastNameError: PropTypes.func,
    emailError: PropTypes.func,
    validateFirstName: PropTypes.func.isRequired,
    validateLastName: PropTypes.func.isRequired,
    validateEmail: PropTypes.func.isRequired,
    handleFirstNameChange: PropTypes.func.isRequired,
    handleLastNameChange: PropTypes.func.isRequired,
    handleEmailChange: PropTypes.func.isRequired,
    handleSelectedCompanyChange: PropTypes.func.isRequired,
    handleSelectedRoleChange: PropTypes.func.isRequired,
    handleSave: PropTypes.func.isRequired,
    reverifyDialogOpened: PropTypes.bool,
    handleReverify: PropTypes.func.isRequired,
    handleOpenReverifyDialog: PropTypes.func.isRequired,
    handleCloseReverifyDialog: PropTypes.func.isRequired,
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
      handleSelectedRoleChange,
   } = this.props;

    const { formatMessage } = this.props.intl;
    const companyOptions = _.map(managingCompanies, company => ({
      label: company.name,
      value: company.id,
    }));

    let roleOptions;
    // render options when selected company
    if (selectedCompany) {
      const selectedCompanyObject = _.find(managingCompanies, company =>
        company.id === selectedCompany);
      roleOptions = _.map(selectedCompanyObject.roles, role => ({
        label: role.name,
        value: role._id,
      }));
    } else {
      roleOptions = [];
    }
    return (
      <form className="account-form" onSubmit={this.props.handleSave}>
        <ConfirmationDialog
          isOpen={this.props.reverifyDialogOpened}
          onConfirm={this.props.handleReverify}
          onCancel={this.props.handleCloseReverifyDialog}
          confirmLabel={formatMessage(MESSAGES.reverify)}
        >
          <div>Are you sure want to send reverify email to this user?</div>
        </ConfirmationDialog>

        <FormField label="User Name">
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

        <FormField label="Email">
          {/* No requirement for reverify, user can go to forgot password page to request again
          <If condition={!this.props.isVerified && !this.props.isCreate}>
            <span
              className="account-reverify-email"
              onClick={this.props.handleOpenReverifyDialog}
            >Reverify</span>
          </If>*/}
          <input
            ref="email"
            name="email"
            placeholder={formatMessage(MESSAGES.email)}
            className={classnames('radius', { error: this.props.emailError })}
            type="email"
            value={email}
            onBlur={this.props.validateEmail}
            onChange={this.props.handleEmailChange}
            onKeyPress={this.onSubmit}
          />
          <label className={classnames({ hide: !this.props.emailError })}>
            {this.props.emailError}
          </label>
        </FormField>

        <FormField label="Company">
          <Select
            className="account-form__select large radius"
            searchable={false}
            clearable={false}
            options={companyOptions}
            value={selectedCompany}
            onChange={handleSelectedCompanyChange}
            placeholder={formatMessage(MESSAGES.selectCompany)}
          />
        </FormField>

        <FormField label="Role">
          <Select
            className="account-form__select large radius"
            searchable={false}
            clearable={false}
            multi
            options={roleOptions}
            value={selectedRoles}
            onChange={handleSelectedRoleChange}
            placeholder={formatMessage(MESSAGES.selectRole)}
          />
        </FormField>
      </form>
    );
  }
}

export default injectIntl(AccountForm);
