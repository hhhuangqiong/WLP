import _ from 'lodash';
import React, { PropTypes, Component } from 'react';
import classnames from 'classnames';
import Select from 'react-select';
import Tooltip from 'rc-tooltip'
import Joi from 'joi';

import FormField from '../../../main/components/FormField';
import PredefinedGroups from '../constants/PredefinedGroups';
import ConfirmationDialog from '../../../main/components/ConfirmationDialog';

const COMPANY_DROPDOWN_PLACEHOLDER = "Choose companies";
const COMPANY_NO_RESULT_TEXT = "No records";

export default class AccountForm extends Component {
  static propTypes = {
    isVerified: PropTypes.bool.isRequired,
    isCreate: PropTypes.bool.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    assignedGroup: PropTypes.string.isRequired,
    assignedCompanies: PropTypes.array,
    carrierManagingCompanies: PropTypes.object,
    affiliatedCompany: PropTypes.string,
    currentCompany: PropTypes.string.isRequired,
    firstNameError: PropTypes.func,
    lastNameError: PropTypes.func,
    emailError: PropTypes.func,
    validateFirstName: PropTypes.func.isRequired,
    validateLastName: PropTypes.func.isRequired,
    validateEmail: PropTypes.func.isRequired,
    handleFirstNameChange: PropTypes.func.isRequired,
    handleLastNameChange: PropTypes.func.isRequired,
    handleEmailChange: PropTypes.func.isRequired,
    handleGroupChange: PropTypes.func.isRequired,
    handleAssignedCompanyChange: PropTypes.func.isRequired,
    handleSave: PropTypes.func.isRequired,
    reverifyDialogOpened: PropTypes.bool,
    handleReverify: PropTypes.func.isRequired,
    handleOpenReverifyDialog: PropTypes.func.isRequired,
    handleCloseReverifyDialog: PropTypes.func.isRequired
  };

  constructor() {
    super();
  }

  renderUserGroupDisplay(data) {
    return (
      <div>
        <span className={`icon-${data.label}`}></span>
        <span className="account-form__select_label">{data.value}</span>
      </div>
    );
  }

  renderCompaniesDisplay(data) {
    return <div>{data.label}</div>;
  }

  renderCompanyValueDisplay = ({ label, value }) => {
    let { carrierManagingCompanies } = this.props;

    if (_.isEmpty(carrierManagingCompanies)) return;

    let selectedCompany = carrierManagingCompanies.find(company => company._id === value);

    if (!selectedCompany) return;

    return <div>{selectedCompany.name}</div>;
  }

  onSubmit = (e) => {
    if (e.which === 13) {
      e.preventDefault();
      this.props.handleSave(e);
    }
  }

  render() {
    let {
      firstName, lastName, email, assignedGroup, isCreate,
      carrierManagingCompanies, currentCompany, affiliatedCompany, assignedCompanies,
      handleCompanyChange, handleAssignedCompanyChange
    } = this.props;

    let userName = `${firstName} ${lastName}`;

    let companyOptions = _.isEmpty(carrierManagingCompanies) ? [{ label: currentCompany.name, value: currentCompany._id }] : carrierManagingCompanies.map(company => ({ label: company.name, value: company._id }))

    return (
      <form className="account-form" onSubmit={this.props.handleSave}>
        <ConfirmationDialog
          isOpen={this.props.reverifyDialogOpened}
          onConfirm={this.props.handleReverify}
          onCancel={this.props.handleCloseReverifyDialog}
          confirmLabel="Reverify"
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
                placeholder="First Name"
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
                placeholder="Last Name"
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
          <If condition={!this.props.isVerified && !this.props.isCreate}>
            <span
              className="account-reverify-email"
              onClick={this.props.handleOpenReverifyDialog}
            >Reverify</span>
          </If>
          <input
            ref="email"
            name="email"
            placeholder="Email"
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

        <FormField label="User Group">
          <Select
            ref="assignedGroup"
            className="account-form__select large radius"
            searchable={false}
            clearable={false}
            options={Object.keys(PredefinedGroups).map(group => ({ label: group, value: group }))}
            value={assignedGroup}
            valueRenderer={this.renderUserGroupDisplay}
            optionRenderer={this.renderUserGroupDisplay}
            onChange={this.props.handleGroupChange}
          />
        </FormField>

        <If condition={!_.isEmpty(carrierManagingCompanies)}>
          <div>
            <FormField label="Company">
              <Select
                ref="affiliatedCompany"
                className="account-form__select large radius"
                searchable={false}
                clearable={false}
                options={companyOptions}
                value={affiliatedCompany}
                valueRenderer={this.renderCompanyValueDisplay}
                optionRenderer={this.renderCompaniesDisplay}
                onChange={handleCompanyChange}
              />
            </FormField>

            <div className="row">
              <div className="large-24 columns">
                <label>Company Management</label>

                <ul className="medium-block-grid-2 large-block-grid-3 account-form__company-management">
                  {
                    carrierManagingCompanies.map(company => {
                      return (
                        <li key={company._id}>
                          <input id={company._id} type="checkbox" checked={assignedCompanies.indexOf(company._id) >= 0} onChange={this.props.handleAssignedCompanyChange} />
                          <label htmlFor={company._id}>{company.name}</label>
                        </li>
                      )
                    })
                  }
                </ul>
              </div>
            </div>
          </div>
        </If>

      </form>
    );
  }
}
