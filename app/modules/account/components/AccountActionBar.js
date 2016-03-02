import React, { PropTypes } from 'react';
import classNames from 'classnames';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';

import AuthStore from '../../../main/stores/AuthStore';
import ConfirmationDialog from '../../../main/components/ConfirmationDialog';

export default React.createClass({
  propTypes: {
    handleSave: PropTypes.func.isRequired,
    handleDiscard: PropTypes.func.isRequired,
    handleDelete: PropTypes.func.isRequired,
    isEnabled: PropTypes.bool.isRequired,
    isCreate: PropTypes.bool.isRequired,
    deleteDialogOpened: PropTypes.bool.isRequired,
    handleOpenDeleteDialog: PropTypes.func.isRequired,
    handleCloseDeleteDialog: PropTypes.func.isRequired,
    accountId: PropTypes.string.isRequired,
  },

  mixins: [FluxibleMixin],

  render() {
    const loggedInUserId = this
      .context
      .getStore(AuthStore)
      .getUserId();

    return (
      <nav className="account-top-bar top-bar top-bar--inner">
        <ConfirmationDialog
          isOpen={this.props.deleteDialogOpened}
          onConfirm={this.props.handleDelete}
          onCancel={this.props.handleCloseDeleteDialog}
          confirmLabel="Delete"
        >
          <div>Are you sure want to delete this user?</div>
        </ConfirmationDialog>

        <div className="top-bar-section">

          <ul className="top-bar--inner">
            <li className="top-bar--inner">
              <If condition={!this.props.isCreate && this.props.accountId !== loggedInUserId}>
                <div
                  role="button"
                  tabIndex="2"
                  className="account-top-bar__button-secondary button round icon-delete"
                  onClick={this.props.handleOpenDeleteDialog}
                ></div>
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
                >Discard</div>
              </If>
            </li>
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
              >Save</div>
            </li>
          </ul>

        </div>
      </nav>
    );
  },
});
