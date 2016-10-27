import React, { PropTypes } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { MESSAGES } from './../constants/i18n';
import { ROLE_EDIT_STAGES } from './../constants/roleEditing';
import i18nMessages from '../../../main/constants/i18nMessages';
import _ from 'lodash';
import Icon from '../../../main/components/Icon';

const RoleSelectedList = (props) => {
  const { formatMessage } = props.intl;

  return (
    <div className="account-form__assigned-role__company-list">
      <div>
        <span className="company-name">{props.selectedCompany.name}</span>
        {
          !props.editRole ?
          <span
            className="account-form-link underline"
            onClick={() => props.handleRoleEditStageChanged(ROLE_EDIT_STAGES.selectCompany)}
          >
            {formatMessage(MESSAGES.changeCompany)}
          </span> : null
        }
        <span
          className="right delete"
          onClick={() => props.handleRoleEditStageChanged(ROLE_EDIT_STAGES.addNewRole)}
        >
          <Icon symbol="icon-error" />
        </span>
      </div>
      <div className="select-company__role">
        <span>{formatMessage(MESSAGES.selectRole)}:</span>
      </div>
      <div className="account-form__selected-role">
      {
        _.map(props.selectedCompany.roles, (role, index) =>
          <div className="role" key={index}>
            <input
              id={role.id}
              type="checkbox"
              className="role-name"
              value={role.id}
              key={index}
              checked={_.includes(props.selectedRoles, role.id)}
              onChange={props.handleSelectedRoleChange}
            />
            <label htmlFor={role.id}>{role.name}</label>
          </div>
        )
      }
      </div>
      <div role="button"
        className="account-top-bar__button-primary button round item right"
        onClick={props.handleSaveCompany}
      >
        <span>{formatMessage(i18nMessages.save)}</span>
      </div>
      {
        props.editRole ?
        <div role="button"
          className="account-top-bar__button-primary button round item left"
          onClick={() => props.handleDeleteCompany(props.selectedCompany.id)}
        >
          <span>{formatMessage(i18nMessages.delete)}</span>
        </div> : null
      }
    </div>
  );
};

RoleSelectedList.propTypes = {
  intl: intlShape.isRequired,
  editRole: PropTypes.bool.isRequired,
  selectedCompany: PropTypes.object,
  selectedRoles: PropTypes.array,
  handleRoleEditStageChanged: PropTypes.func.isRequired,
  handleSelectedRoleChange: PropTypes.func.isRequired,
  handleDeleteCompany: PropTypes.func,
  handleSaveCompany: PropTypes.func.isRequired,
};

export default injectIntl(RoleSelectedList);

