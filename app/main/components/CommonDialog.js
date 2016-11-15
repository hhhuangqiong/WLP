import React, { PropTypes } from 'react';
import Modal from 'react-modal';
import { CLIENT } from '../../utils/env';
import classNames from 'classnames';
/**
 * A confirmation dialog that utilizes react-modal.
 * To use, add the message as the child of this component.
 *
 * @class CommonDialog
 * @example
 * // inside render()
 * <CommonDialog
 *   isOpen={this.state.showDialog}
 *   title="Hold on"
 *   onConfirm={this.handleConfirm}
 *   onCancel={this.handleCancel}
 *   confirmLabel="Do it anyway!"
 * >
 *   <p>You are about to delete the user.</p>
 *   <p>This operation cannot be undone. Delete anyway?</p>
 * </CommonDialog>
 */
const CommonDialog = React.createClass({
  displayName: 'CommonDialog',

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
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func.isRequired,
    dialogHeader: PropTypes.string,
    isMultipleError: PropTypes.bool,
    children: PropTypes.element,
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
    const {
      isOpen,
      onCancel,
      onConfirm,
      confirmLabel,
      cancelLabel,
      dialogHeader,
      children,
      isMultipleError,
    } = this.props;
    return (
      <Modal
        className="confirmation"
        overlayClassName="OverlayClass"
        isOpen={isOpen}
      >
        <If condition={this.props.title}>
          <div className="confirmation__header">
            <h4 className="confirmation__header__title">{this.props.title}</h4>
          </div>
        </If>
        <div className={classNames('confirmation__body',
          { 'confirmation__body--error': isMultipleError })}
        >
          <div className="dialog-header">
            {dialogHeader}
          </div>
          <div className="dialog-body">
            {children}
            <div className="confirmation__footer">
              <button
                className="confirmation__footer__button confirm button confirmation__button--delete"
                role="confirm"
                onClick={onConfirm}
              >
                {confirmLabel}
              </button>
              {onCancel ? (
                <button
                  className="confirmation__footer__button confirm button confirmation__button--cancel"
                  role="cancel"
                  onClick={onCancel}
                >
                  {cancelLabel}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </Modal>
    );
  },
});

export default CommonDialog;
