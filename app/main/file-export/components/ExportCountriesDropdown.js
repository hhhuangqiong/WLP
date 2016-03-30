import React from 'react';

import { countries } from 'country-data';

export default React.createClass({
  propTypes: {
    displayName: React.PropTypes.string,
    defaultOption: React.PropTypes.string,
    value: React.PropTypes.string,
    onChange: React.PropTypes.func,
  },

  render() {
    return (
      <div className="export-row">
        <label className="left bold">{this.props.displayName}</label>

        <select
          className="large export-countries-dropdown radius"
          value={this.props.value}
          onChange={this.props.onChange}
        >
          <option>{this.props.defaultOption}</option>
          {countries.all.map(country => (
            <option
              key={country.alpha2}
              value={country.alpha2}
            >{country.name}</option>
          ))}
        </select>
      </div>
    );
  },
});
