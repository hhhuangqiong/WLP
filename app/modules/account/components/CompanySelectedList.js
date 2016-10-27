import React, { PropTypes } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import { MESSAGES } from './../constants/i18n';
import classNames from 'classnames';
import i18nMessages from '../../../main/constants/i18nMessages';
import Icon from '../../../main/components/Icon';
import { ROLE_EDIT_STAGES } from './../constants/roleEditing';

const CompanySelectedList = (props) => {
  const { formatMessage } = props.intl;
  return (
    <div className="account-form__assigned-role__company-list">
      <div>
        <span className="select-company__header">
          {formatMessage(MESSAGES.selectCompany)}
        </span>
        <span
          className="right delete"
          onClick={() => props.handleRoleEditStageChanged(ROLE_EDIT_STAGES.addNewRole)}
        >
          <Icon symbol="icon-error" />
        </span>
      </div>
      <div className="account-form__selected-company">
      {
        props.managingCompanies.map((company) =>
          <div
            key={company.id}
            className={classNames('company', { active: company.id === props.selectedCompany.id })}
            onClick={() => props.handleSelectedCompanyChange(company.id)}
          >
            {company.name}
          </div>
        )
      }
      </div>
      <div role="button"
        className="account-top-bar__button-primary button round item right"
        onClick={() => props.handleRoleEditStageChanged(ROLE_EDIT_STAGES.selectRole)}
      >
        <span>{formatMessage(i18nMessages.next)}</span>
      </div>
    </div>
  );
};

CompanySelectedList.propTypes = {
  intl: intlShape.isRequired,
  currentRoles: PropTypes.object,
  selectedCompany: PropTypes.object,
  managingCompanies: PropTypes.array,
  handleRoleEditStageChanged: PropTypes.func.isRequired,
  handleSelectedCompanyChange: PropTypes.func,
};

export default injectIntl(CompanySelectedList);

