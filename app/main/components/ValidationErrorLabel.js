import React, { PropTypes } from 'react';
import classNames from 'classnames';

const ValidationErrorLabelPropTypes = {
  messages: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string,
};

const ValidationErrorLabel = (props) => {
  const { messages, className } = props;
  if (!messages || !messages.length) {
    // expect the return to be a react component rather than null
    return (<span />);
  }
  return (
    <label className={classNames('validation-error', className)}>
      {messages.map((errorMsg, index) => (
        <div key={index}>{errorMsg}</div>
      ))}
    </label>
  );
};

ValidationErrorLabel.propTypes = ValidationErrorLabelPropTypes;
export default ValidationErrorLabel;
