import React, { createClass, PropTypes } from 'react';

import classNames from 'classnames';
import PredefinedGroups from '../constants/PredefinedGroups';
import CircleIcon from '../../../main/components/CircleIcon';

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
    assignedGroup: PropTypes.string,
  },

  render() {
    const firstName = this.props.firstName || '<First Name>';
    const lastName = this.props.lastName || '<Last Name>';
    const assignedGroup = this.props.assignedGroup || DEFAULT_GROUP;
    const createdAt = this.props.createdAt;
    const status = this.props.isVerified ? SUCCESS_LABEL : FAIL_LABEL;
    const groupSettings = PredefinedGroups.default;

    return (
      <div className="profile-info">

        <div className="profile-info__status right">
          <span className={
            classNames(
              'label',
              'status',
              this.props.isVerified ? 'success' : 'alert'
            )}
          ></span>

          <span className={
            classNames(
              'profile-info__status__message',
              this.props.isVerified ? 'success' : 'alert'
            )}
          >{status}</span>
        </div>

        <div className="profile-info__icon">
          <div>
            <CircleIcon
              size="large"
              backgroundColor={groupSettings.backgroundColor}
              iconColor={groupSettings.iconColor}
              icon={groupSettings.icon}
            />
          </div>
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
  },
});
