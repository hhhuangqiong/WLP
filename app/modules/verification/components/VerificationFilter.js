import React, { Component } from 'react';
import classNames from 'classnames';

import Dropdown from '../../../main/dropdown/Dropdown';

export default class VerificationFilter extends Component {
  render() {
    let appId = this.props.appId;
    let options = this.props.appIdOptions;
    let appIdChange = this.props.appIdChange;

    let os = this.props.os;
    let osTypes = this.props.osTypes;
    let osChange = this.props.osChange;

    let method = this.props.method;
    let methods = this.props.methods;
    let methodChange = this.props.methodChange;

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
              value={appId ? appId : "-"}
              onChange={appIdChange}
            >
              {options.map((appId) => {
                return (
                  <option key={appId.label} value={appId.value}>
                    {appId.label}
                  </option>
                )
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
                  )
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
                )
              })}
            </select>
          </div>
        </Dropdown.Content>
      </Dropdown>
    );
  }
}
