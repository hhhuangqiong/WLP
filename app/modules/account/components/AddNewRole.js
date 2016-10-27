import React, { PropTypes } from 'react';
import _ from 'lodash';
import { FormattedMessage } from 'react-intl';
import RolesList from './RolesList';
import { ROLE_EDIT_STAGES } from './../constants/roleEditing';
import { MESSAGES } from './../constants/i18n';

const AddNewRole = (props) => (
  <div>
    <span
      className="account-form-link"
      onClick={() => props.handleRoleEditStageChanged(ROLE_EDIT_STAGES.selectCompany)}
    >
      + <FormattedMessage {...MESSAGES.addNewRole} />
    </span>
    {
      !_.isEmpty(props.currentRoles) ?
      <RolesList
        currentRoles={props.currentRoles}
        managingCompanies={props.managingCompanies}
        handleEditRole={props.handleEditRole}
        handleDeleteCompany={props.handleDeleteCompany}
      />
      : null
    }
  </div>
);

AddNewRole.propTypes = {
  currentRoles: PropTypes.object,
  managingCompanies: PropTypes.array,
  handleRoleEditStageChanged: PropTypes.func,
  handleDeleteCompany: PropTypes.func,
  handleEditRole: PropTypes.func.isRequired,
};

export default AddNewRole;
