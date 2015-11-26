import React, { createClass, PropTypes } from 'react';

import classNames from 'classnames';
import PredefinedGroups from '../constants/PredefinedGroups';
import CircleIcon from '../../../main/components/CircleIcon';

const SUCCESS_CLASS = 'active';
const SUCCESS_LABEL = 'Verified';
const FAIL_LABEL = 'Inactive';
const DEFAULT_GROUP = 'technical';

export default createClass({
  displayName: 'AccountInfo',

  propTypes: {
    isVerified: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    createdAt: PropTypes.string,
    assignedGroup: PropTypes.string
  },

  render() {
    let firstName = this.props.firstName || '<First Name>';
    let lastName = this.props.lastName || '<Last Name>';
    let assignedGroup = this.props.assignedGroup || DEFAULT_GROUP;
    let createdAt = this.props.createdAt;
    let status = this.props.isVerified ? SUCCESS_LABEL : FAIL_LABEL;
    let groupSettings = PredefinedGroups[assignedGroup];

    return (
      <div className="profile-info">

        <div className="profile-info__status right">
          <span className={classNames('label', 'status', this.props.isVerified ? 'success' : 'alert')}></span>

          <span className={classNames('profile-info__status__message', this.props.isVerified ? 'success' : 'alert')}>{status}</span>
        </div>

        <div className="profile-info__icon">
          <CircleIcon
            size="large"
            backgroundColor={groupSettings.backgroundColor}
            iconColor={groupSettings.iconColor}
            icon={groupSettings.icon}
          />
        </div>

        <h5>{firstName} {lastName}</h5>

        <If condition={createdAt}>
          <div className="profile-info__time">
            <span className="profile-info__created_on">Created on</span>
            <span>{createdAt}</span>
          </div>
        </If>
      </div>
    );
  }
});
