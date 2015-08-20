import _ from 'lodash';
import React, { PropTypes } from 'react';
import Select from 'react-select';
import CountryFlag from './CountryFlag';

let countryData = require('../../data/countries.json');

/**
 * @class CountrySelectBox
 * @classdesc to create a country select box showing
 * country flag icon and name side by side
 *
 * @see https://github.com/JedWatson/react-select
 */
let CountrySelectBox = React.createClass({
  PropTypes: {
    // name attribute of input tag
    name: PropTypes.string.isRequired,

    // value attribute of input tag
    value: PropTypes.string,

    // placeholder attribute of input tag
    placeholder: PropTypes.string,

    // you may pass the country data externally
    // it must contain keys of only `label` and `value`
    // by default, it uses our own json data file
    options: PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string
    }),

    // to enable search(filter) function
    // of the select box
    // default is `false`
    searchable: PropTypes.bool,

    // to display country flag in selected field
    // default is `true`
    showFlag: PropTypes.bool,

    // to display country name in selected field
    // default is `true`
    showText: PropTypes.bool,

    onChange: PropTypes.func.isRequired
  },

  getDefaultProps: function() {
    return {
      name: 'country',
      value: null,
      placeholder: 'please select a country',
      options: null,
      searchable: false,
      showFlag: true,
      showText: true
    };
  },

  _renderOption: function(option) {
    return (
      <div>
        <CountryFlag code={option.value} />
        { option.label }
      </div>
    );
  },

  _renderValue: function(option) {
    return (
      <div>
        <If condition={this.props.showFlag}>
          <CountryFlag code={option.value} />
        </If>
        <If condition={this.props.showText}>
          { option.label }
        </If>
      </div>
    );
  },

  render: function() {
    return (
      <Select
          className="country-select-box"
          name={this.props.name}
          value={this.props.value}
          placeholder={this.props.placeholder}
          matchProp="any"
          searchable={this.props.searchable}
          clearable={false}
          options={this.props.options || _.transform(countryData, (result, country, key) => {
            result[key] = {
              value: country.alpha2,
              label: country.name
            }
          })}
          optionRenderer={this._renderOption}
          valueRenderer={this._renderValue}
          onChange={this.props.onChange}
        />
    );
  }
});

export default CountrySelectBox;
