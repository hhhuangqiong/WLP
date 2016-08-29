import React, { PropTypes } from 'react';
import _ from 'lodash';

const CompanyCapabilities = (props) => {
  const {
    capabilities,
    onCapabilitiesChange,
    capabilitiesChecked,
    disabled,
  } = props;
  return (
    <div className="company-capabilities">
      {
        _.map(capabilities, (value, key) => (
        <div className="checkbox-capabilities" key={key}>
          <input
            type="checkbox"
            value={key}
            onChange={onCapabilitiesChange}
            checked={_.includes(capabilitiesChecked, key)}
            disabled={disabled}
          />
          <label>{value}</label>
        </div>
        ))
      }
    </div>
  );
};
CompanyCapabilities.propTypes = {
  capabilities: PropTypes.object,
  onCapabilitiesChange: PropTypes.func,
  isChecked: PropTypes.func,
  capabilitiesChecked: PropTypes.array,
  disabled: PropTypes.bool.isRequired,
};

export default CompanyCapabilities;
