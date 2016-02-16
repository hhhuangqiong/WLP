import React, { PropTypes } from 'react';
import Modal from 'react-modal';
import { CLIENT } from '../../utils/env';

/**
 * A confirmation dialog that utilizes react-modal.
 * To use, add the message as the child of this component.
 *
 * @class ConfirmationDialog
 * @example
 * // inside render()
 * <ConfirmationDialog
 *   isOpen={this.state.showDialog}
 *   title="Hold on"
 *   onConfirm={this.handleConfirm}
 *   onCancel={this.handleCancel}
 *   confirmLabel="Do it anyway!"
 * >
 *   <p>You are about to delete the user.</p>
 *   <p>This operation cannot be undone. Delete anyway?</p>
 * </ConfirmationDialog>
 */
const ConfirmationDialog = React.createClass({
  displayName: 'ConfirmationDialog',

  propTypes: {
    /**
     * Control the visibility of the dialog.
     * @type {Boolean}
     */
    isOpen: PropTypes.bool,
    /**
     * The dialog title, optional. If specified, a dialog header will be shown.
     * @type {String}
     */
    title: PropTypes.string,
    /**
     * The text displayed on the confirm button.
     * @type {String}
     */
    confirmLabel: PropTypes.string,
    /**
     * The text displayed on the cancel button.
     * @type {String}
     */
    cancelLabel: PropTypes.string,
  },

  getDefaultProps() {
    return {
      confirmLabel: 'OK',
      cancelLabel: 'Cancel',
    };
  },

  componentWillMount() {
    if (CLIENT) Modal.setAppElement(document.getElementById('app'));
  },

  render() {
    return (
      <Modal className="confirmation" isOpen={this.props.isOpen}>
        <If condition={this.props.title}>
          <div className="confirmation__header">
            <h4 className="confirmation__header__title">{this.props.title}</h4>
          </div>
        </If>

        <div className="confirmation__body">
          {this.props.children}
        </div>

        <div className="confirmation__footer">
          <button className="confirmation__footer__button cancel button--secondary" role='cancel' onClick={this.props.onCancel}>
            {this.props.cancelLabel}
          </button>
          <button className="confirmation__footer__button confirm button--primary" role='confirm' onClick={this.props.onConfirm}>
            {this.props.confirmLabel}
          </button>
        </div>
      </Modal>
    );
  },
});

export default ConfirmationDialog;
