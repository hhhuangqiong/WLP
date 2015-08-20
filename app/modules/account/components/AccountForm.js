import _ from 'lodash';
import React, { PropTypes, Component } from 'react';
import Select from 'react-select';
import Tooltip from 'rc-tooltip'
import Joi from 'joi';

import FormField from '../../../main/components/FormField';
import PredefinedGroups from '../constants/PredefinedGroups';
import validator from '../../../main/components/ValidateDecorator';
import ConfirmationDialog from '../../../main/components/ConfirmationDialog';

const COMPANY_DROPDOWN_PLACEHOLDER = "Choose companies";
const COMPANY_NO_RESULT_TEXT = "No records";

@validator({
  email: Joi.string().email().required(),
  firstName: Joi.string().min(1).max(30).required(),
  lastName: Joi.string().min(1).max(30).required()
})
export default class AccountForm extends Component {
  static propTypes = {
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    assignedGroup: PropTypes.string.isRequired,
    assignedCompanies: PropTypes.array.isRequired,
    handleFirstNameChange: PropTypes.func.isRequired,
    handleLastNameChange: PropTypes.func.isRequired,
    handleEmailChange: PropTypes.func.isRequired,
    handleGroupChange: PropTypes.func.isRequired,
    handleCompanyChange: PropTypes.func.isRequired,
    handleSave: PropTypes.func.isRequired,
    reverifyDialogOpened: PropTypes.bool.isRequired,
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
        <span className="account-form__user-group_label">{data.value}</span>
      </div>
    );
  }

  renderCompaniesDisplay(data) {
    return (<div>{data.label}</div>);
  }

  renderCompaniesDropdown(data) {
    return (<div>{data.label}</div>);
  }

  inputOnBlur = (event) => {
    this.props.validate(event);
    this.props.handleErrorState(this.props.isError());
  }

  render() {
    let firstName = this.props.firstName;
    let lastName = this.props.lastName;
    let userName = `${firstName} ${lastName}`;

    let email = this.props.email;
    let assignedGroup = this.props.assignedGroup;

    let assignedCompanies = _.pluck(this.props.assignedCompanies, 'name');
    let assignedCompaniesBeforeChange = _.pluck(_.clone(this.props.assignedCompanies, true), 'name');

    let nonSelectedCompanies = assignedCompaniesBeforeChange
      .filter(company => {
        return !_.find(assignedCompanies, assignedCompany => company === assignedCompany);
      })
      .map(company => {
        return {
          label: company,
          value: company
        }
      });

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
                className="radius"
                type="text"
                placeholder="First Name"
                value={firstName}
                onBlur={this.inputOnBlur}
                onChange={this.props.handleFirstNameChange}
              />
            </div>

            <div className="large-12 columns">
              <input
                ref="lastName"
                name="lastName"
                className="radius"
                type="text"
                placeholder="Last Name"
                value={lastName}
                onBlur={this.inputOnBlur}
                onChange={this.props.handleLastNameChange}
              />
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
            className="radius"
            type="email"
            value={email}
            onBlur={this.inputOnBlur}
            onChange={this.props.handleEmailChange}
          />
        </FormField>

        <FormField label="User Group" leftColumns="7" rightColumns="17">
          <Select
            ref="assignedGroup"
            className="account-form__user-group large radius"
            searchable={false}
            clearable={false}
            options={Object.keys(PredefinedGroups).map(group => ({ label: group, value: group }))}
            value={assignedGroup}
            valueRenderer={this.renderUserGroupDisplay}
            optionRenderer={this.renderUserGroupDisplay}
            onChange={this.props.handleGroupChange}
          />
        </FormField>

        <If condition={assignedCompanies.length}>
          <div className="row">
            <div className="large-24 columns">
              <label>Company Management</label>
              <Select
                ref="assignedCompanies"
                placeholder={COMPANY_DROPDOWN_PLACEHOLDER}
                noResultsText={COMPANY_NO_RESULT_TEXT}
                className="account-form__company-management"
                multi={true}
                clearable={false}
                value={assignedCompanies}
                options={nonSelectedCompanies}
                valueRenderer={this.renderCompaniesDisplay}
                optionRenderer={this.renderCompaniesDropdown}
                onChange={this.props.handleCompanyChange}
              />
              <span className="account-form__company-selected">{assignedCompanies.length} selected</span>
            </div>
          </div>
        </If>

      </form>
    );
  }
}
