import React from 'react';

import { countries } from 'country-data';

export default React.createClass({
  propTypes: {
    displayName: React.PropTypes.string,
    defaultOption: React.PropTypes.string,
    value: React.PropTypes.string,
    onChange: React.PropTypes.func
  },

  render() {
    return (
      <div className="row">
        <div className="large-5 columns">
          <label className="left bold">{this.props.displayName}</label>
        </div>

        <div className="large-7 columns">
          <select
            className="large export-countries-dropdown radius"
            value={this.props.value}
            onChange={this.props.onChange}
          >
            <option>{this.props.defaultOption}</option>
            {countries.all.map(country => {
              return (
                <option
                  key={country.alpha2}
                  value={country.alpha2}
                >{country.name}</option>
              )
            })}
          </select>
        </div>
      </div>
    );
  }
});
