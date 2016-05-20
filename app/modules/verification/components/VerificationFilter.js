import React, { Component, PropTypes } from 'react';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from 'react-intl';

import Dropdown from '../../../main/dropdown';

class VerificationFilter extends Component {
  render() {
    const {
      appId,
      options,
      appIdChange,
      os,
      osTypes,
      osChange,
      method,
      methods,
      methodChange,
      intl: { formatMessage },
    } = this.props;

    return (
      <Dropdown>
        <Dropdown.Trigger>
          <nav className="verification-filter-button">
            <span className="verification-filter-button__text">
              <FormattedMessage
                id="filter"
                defaultMessage="Filter"
              />
            </span>
            <span className="icon-dropdown" />
          </nav>
        </Dropdown.Trigger>

        <Dropdown.Content className="verification-dropdown">
          <div>
            <label className="bold">
              <FormattedMessage
                id="appId"
                defaultMessage="Application ID"
              />
            </label>

            <select
              className="radius"
              name="appid"
              value={appId || '-'}
              onChange={appIdChange}
            >
              {options.map(option => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="bold">
              <FormattedMessage
                id="vsdk.details.method"
                defaultMessage="Verfication Method"
              />
            </label>

            <select
              className="radius"
              value={method}
              onChange={methodChange}
            >
              <option>{this.props.defaultOption}</option>
                {methods.map(type => (
                  <option key={type} value={type}>
                    {this.props.transformVerificationTypes(formatMessage(type))}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="bold">
              <FormattedMessage
                id="vsdk.details.osType"
                defaultMessage="OS Type"
              />
            </label>

            <select
              className="radius"
              value={os}
              onChange={osChange}
            >
              <option>{this.props.defaultOption}</option>
              {osTypes.map(platform => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </div>
        </Dropdown.Content>
      </Dropdown>
    );
  }
}

VerificationFilter.defaultProps = {
  options: [],
  osTypes: [],
  methods: [],
};

VerificationFilter.propTypes = {
  appId: PropTypes.string,
  options: PropTypes.array.isRequired,
  appIdChange: PropTypes.func,
  os: PropTypes.string,
  osTypes: PropTypes.array.isRequired,
  osChange: PropTypes.func,
  method: PropTypes.string,
  methods: PropTypes.array.isRequired,
  methodChange: PropTypes.func,
  defaultOption: PropTypes.string,
  transformVerificationTypes: PropTypes.func,
  intl: intlShape.isRequired,
};

export default injectIntl(VerificationFilter);
