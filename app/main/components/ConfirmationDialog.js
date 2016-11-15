import React, { PropTypes } from 'react';
import CommonDialog from './CommonDialog';

const ConfirmationDialog = (props) => {
  const {
    dialogMessage,
    ...restProps,
  } = props;
  return (
    <CommonDialog {...restProps}>
      <div className="dialog-info">
        <span dangerouslySetInnerHTML={{ __html: dialogMessage }} />
      </div>
    </CommonDialog>
  );
};

ConfirmationDialog.propTypes = {
  isOpen: PropTypes.bool,
  title: PropTypes.string,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func.isRequired,
  dialogHeader: PropTypes.string,
  isMultipleError: PropTypes.bool,
  children: PropTypes.element,
  dialogMessage: PropTypes.string,
};

export default ConfirmationDialog;
