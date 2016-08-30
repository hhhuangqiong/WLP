import React, { createClass, PropTypes } from 'react';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

import classNames from 'classnames';
import CircleIcon from '../../../main/components/CircleIcon';

const SUCCESS_LABEL = 'Verified';
const FAIL_LABEL = 'Inactive';

const AccountInfo = createClass({
  displayName: 'AccountInfo',

  propTypes: {
    intl: intlShape.isRequired,
    isVerified: PropTypes.bool,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    createdAt: PropTypes.string,
  },

  render() {
    const firstName = this.props.firstName || '<First Name>';
    const lastName = this.props.lastName || '<Last Name>';
    const createdAt = this.props.createdAt;
    const status = this.props.isVerified ? SUCCESS_LABEL : FAIL_LABEL;

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
            {/* @TODO update the icon when it is ready */}
            <CircleIcon
              size="large"
              backgroundColor="#E33238"
              icon="icon-person"
            />
          </div>
        </div>

        <h5>{firstName} {lastName}</h5>

        <If condition={createdAt}>
          <div className="profile-info__time">
            <span className="profile-info__created_on">
              <FormattedMessage
                id="createdOn"
                defaultMessage="Created on"
              />
            </span>
            <span>{createdAt}</span>
          </div>
        </If>
      </div>
    );
  },
});

export default injectIntl(AccountInfo);
