import React, { PropTypes } from 'react';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import classNames from 'classnames';

import Icon from '../../../main/components/Icon';
import i18nMessages from '../../../main/constants/i18nMessages';
import { SMSC_DATA_ID } from '../constants/companyOptions';
import ValidationErrorLabel from '../../../main/components/ValidationErrorLabel';

const SmscBindingDialogPropTypes = {
  intl: intlShape.isRequired,
  values: PropTypes.shape({
    ip: PropTypes.string,
    port: PropTypes.string,
  }).isRequired,
  onFieldChange: PropTypes.func.isRequired,
  selectedBindingIndex: PropTypes.number,
  handleDeleteBinding: PropTypes.func,
  handleUpdateBinding: PropTypes.func,
  handleAddBinding: PropTypes.func,
  handleCloseBindingDialog: PropTypes.func.isRequired,
  isValid: PropTypes.func.isRequired,
  validateField: PropTypes.func.isRequired,
  getValidationMessages: PropTypes.func.isRequired,
};

const SmscBindingDialog = (props) => {
  const {
    intl: { formatMessage },
    values,
    onFieldChange,
    handleDeleteBinding,
    handleUpdateBinding,
    handleAddBinding,
    handleCloseBindingDialog,
    selectedBindingIndex,
    isValid,
    validateField,
    getValidationMessages,
  } = props;
  return (
    <div className="company-smsc-setting__dialog">
      <div className="row">
        <div className="small-10 columns">
          <label>
            <FormattedMessage id="smscBinding" defaultMessage="SMSC Binding" />:
          </label>
        </div>
        <div className="right" onClick={handleCloseBindingDialog}>
          <Icon symbol="icon-error" />
        </div>
      </div>
      <div className="row">
        <div className="small-10 columns">
          <label>
            <FormattedMessage id="ip" defaultMessage="IP Address" />:
          </label>
        </div>
        <div className="small-14 columns">
          <input
            className={classNames('radius', { error: !isValid(SMSC_DATA_ID.IP) })}
            type="text"
            value={values.ip}
            onChange={(e) => onFieldChange(SMSC_DATA_ID.IP, e.target.value)}
            onBlur={validateField(SMSC_DATA_ID.IP)}
          />
          <ValidationErrorLabel messages={getValidationMessages(SMSC_DATA_ID.IP)} />
        </div>
      </div>
      <div className="row">
        <div className="small-10 columns">
          <label>
            <FormattedMessage id="port" defaultMessage="Port" />:
          </label>
        </div>
        <div className="small-14 columns">
          <input
            className={classNames('radius', { error: !isValid(SMSC_DATA_ID.PORT) })}
            type="text"
            value={values.port}
            onChange={(e) => onFieldChange(SMSC_DATA_ID.PORT, e.target.value)}
            onBlur={validateField(SMSC_DATA_ID.PORT)}
          />
          <ValidationErrorLabel messages={getValidationMessages(SMSC_DATA_ID.PORT)} />
        </div>
      </div>
      { selectedBindingIndex !== null ?
        <div className="row">
          <div role="button" className="button round left"
            onClick={() => handleDeleteBinding(selectedBindingIndex)}
          >
            <span>{formatMessage(i18nMessages.delete)}</span>
          </div>
          <div role="button" className="button round right"
            onClick={() => handleUpdateBinding(selectedBindingIndex, values)}
          >
            <span>{formatMessage(i18nMessages.save)}</span>
          </div>
        </div>
        :
        <div className="row">
          <div role="button" className="button round right" onClick={() => handleAddBinding(values)}>
            <span>{formatMessage(i18nMessages.add)}</span>
          </div>
          <ValidationErrorLabel messages={getValidationMessages(SMSC_DATA_ID.BINDINGS)} />
        </div>
      }
    </div>
  );
};

SmscBindingDialog.propTypes = SmscBindingDialogPropTypes;

export default injectIntl(SmscBindingDialog);
