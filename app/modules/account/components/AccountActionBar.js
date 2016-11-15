import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { FluxibleMixin } from 'fluxible-addons-react';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';

import AuthStore from '../../../main/stores/AuthStore';
import ConfirmationDialog from '../../../main/components/ConfirmationDialog';
import { MESSAGES } from './../constants/i18n';
import COMMON_MESSAGES from '../../../main/constants/i18nMessages';
import Permit from '../../../main/components/common/Permit';
import { RESOURCE, ACTION, permission } from '../../../main/acl/acl-enums';

const AccountActionBar = React.createClass({
  propTypes: {
    intl: intlShape.isRequired,
    handleSave: PropTypes.func.isRequired,
    handleDiscard: PropTypes.func.isRequired,
    handleDelete: PropTypes.func.isRequired,
    isEnabled: PropTypes.bool.isRequired,
    isCreate: PropTypes.bool.isRequired,
    deleteDialogOpened: PropTypes.bool,
    handleOpenDeleteDialog: PropTypes.func.isRequired,
    handleCloseDeleteDialog: PropTypes.func.isRequired,
    accountId: PropTypes.string.isRequired,
  },

  mixins: [FluxibleMixin],

  getDefaultProps() {
    return {
      deleteDialogOpened: false,
    };
  },
  render() {
    const { deleteDialogOpened, handleCloseDeleteDialog, handleDelete, accountId } = this.props;
    const { formatMessage } = this.props.intl;
    const loggedInUserId = this
      .context
      .getStore(AuthStore)
      .getUserId();
    const dialogMessage = formatMessage(MESSAGES.deleteDialogMessage, { name: accountId });

    return (
      <nav className="account-top-bar top-bar top-bar--inner">
        <ConfirmationDialog
          isOpen={deleteDialogOpened}
          onCancel={handleCloseDeleteDialog}
          onConfirm={handleDelete}
          cancelLabel={formatMessage(COMMON_MESSAGES.cancel)}
          confirmLabel={formatMessage(COMMON_MESSAGES.delete)}
          dialogHeader={formatMessage(MESSAGES.deleteDialogHeader)}
          dialogMessage={dialogMessage}
        />
        <div className="top-bar-section">
          <ul className="top-bar--inner">
            <li className="top-bar--inner">
              <If condition={!this.props.isCreate && this.props.accountId !== loggedInUserId}>
                <Permit permission={permission(RESOURCE.USER, ACTION.DELETE)}>
                  <div
                    role="button"
                    tabIndex="2"
                    className="account-top-bar__button-secondary button round icon-delete"
                    onClick={this.props.handleOpenDeleteDialog}
                  >
                  <FormattedMessage
                    id="Delete"
                    defaultMessage="Delete"
                  />
                  </div>
                </Permit>
              </If>
            </li>
          </ul>

          <ul className="right top-bar--inner">
            <li className="top-bar--inner">
              <If condition={!this.props.isCreate}>
                  <div
                    role="button"
                    tabIndex="1"
                    className={classNames(
                      'account-top-bar__button-secondary',
                      'button',
                      'round',
                      'item',
                      { disabled: !this.props.isEnabled })
                    }
                    onClick={this.props.handleDiscard}
                  >
                  <FormattedMessage
                    id="cancel"
                    defaultMessage="Cancel"
                  />
                  </div>
              </If>
            </li>
            <Permit permission={permission(RESOURCE.USER, ACTION.UPDATE)}>
              <li className="top-bar--inner">
                <div
                  role="button"
                  tabIndex="0"
                  className={classNames(
                    'account-top-bar__button-primary',
                    'button',
                    'round',
                    'large',
                    'item',
                    { disabled: !this.props.isEnabled })
                  }
                  onClick={this.props.handleSave}
                >
                <FormattedMessage
                  id="Save"
                  defaultMessage="Save"
                />
                </div>
              </li>
            </Permit>
          </ul>

        </div>
      </nav>
    );
  },
});

export default injectIntl(AccountActionBar);
