import React, { Component, PropTypes } from 'react';

import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from 'react-intl';

import Dropdown from '../../../main/dropdown';

class VerificationFilter extends Component {
  transformMethodToId(method) {
    switch (method) {
      case 'call-in':
        return 'vsdk.details.callIn';
      case 'call-out':
        return 'vsdk.details.callOut';
      case 'sms':
        return 'vsdk.details.sms';
      case 'ivr':
        return 'vsdk.details.ivr';
      default:
        return '';
    }
  }

  render() {
    const {
      appId,
      appIdOptions,
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
              {
                appIdOptions.map(option => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))
              }
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
              value={this.transformMethodToId(method)}
              onChange={methodChange}
            >
              <option>{this.props.defaultOption}</option>
              {
                methods.map(type => (
                  <option key={type.id} value={type.id}>
                    { formatMessage(type) }
                  </option>
                ))
              }
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
              {
                osTypes.map(platform => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))
              }
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
  appIdOptions: PropTypes.array.isRequired,
  appIdChange: PropTypes.func,
  os: PropTypes.string,
  osTypes: PropTypes.array.isRequired,
  osChange: PropTypes.func,
  method: PropTypes.string,
  methods: PropTypes.array.isRequired,
  methodChange: PropTypes.func,
  defaultOption: PropTypes.string,
  intl: intlShape.isRequired,
};

export default injectIntl(VerificationFilter);
