import React, { Component, PropTypes } from 'react';

import Dropdown from '../../../main/dropdown';

export default class VerificationFilter extends Component {
  static propTypes = {
    appId: PropTypes.string,
    options: PropTypes.array,
    appIdChange: PropTypes.func,
    os: PropTypes.string,
    osTypes: PropTypes.array,
    osChange: PropTypes.func,
    method: PropTypes.string,
    methods: PropTypes.array,
    methodChange: PropTypes.func,
    defaultOption: PropTypes.string,
    transformVerificationTypes: PropTypes.func,
  };

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
    } = this.props;

    return (
      <Dropdown>
        <Dropdown.Trigger>
          <nav className="verification-filter-button">
            <span className="verification-filter-button__text">Filter</span>
            <span className="icon-dropdown" />
          </nav>
        </Dropdown.Trigger>

        <Dropdown.Content className="verification-dropdown">
          <div>
            <label className="bold">Application ID</label>

            <select
              className="radius"
              name="appid"
              value={appId ? appId : '-'}
              onChange={appIdChange}
            >
              {options.map(option => {
                return (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="bold">Verfication Method</label>

            <select
              className="radius"
              value={method}
              onChange={methodChange}
            >
              <option>{this.props.defaultOption}</option>
                {methods.map((type) => {
                  return (
                    <option key={type} value={type}>
                      {this.props.transformVerificationTypes(type)}
                    </option>
                  );
                })}
            </select>
          </div>

          <div>
            <label className="bold">OS Type</label>

            <select
              className="radius"
              value={os}
              onChange={osChange}
            >
              <option>{this.props.defaultOption}</option>
              {osTypes.map((platform) => {
                return (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                );
              })}
            </select>
          </div>
        </Dropdown.Content>
      </Dropdown>
    );
  }
}
