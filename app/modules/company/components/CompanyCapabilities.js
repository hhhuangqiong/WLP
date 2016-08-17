import React, { PropTypes } from 'react';
import _ from 'lodash';

const CompanyCapabilities = (props) => {
  const {
    capabilities,
    onCapabilitiesChange,
   } = props;
  return (
    <div className="company-capabilities">
    {
      _.map(capabilities, (value, key) => (
      <div className="checkbox-capabilities">
        <input type="checkbox" value={key} onChange={onCapabilitiesChange} />
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
};

export default CompanyCapabilities;
