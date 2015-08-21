import React, { PropTypes } from 'react';

/**
 * YOU MUST HAVE A CORRESPONDING CSS FILE BEFORE USING THIS.
 * THIS COULD BE A PRIVATE NPM PACKAGE CONTAINING THE NEEDED
 * JS, CSS AND IMAGES
 *
 * @class CountryFlag
 * @classdesc This is to create the country flag image by css class.
 * @todo accepting custom dimension, it is not done as we do not have
 * a guideline for INLINE CSS IN JS.
 */
let CountryFlag = React.createClass({
  PropTypes: {
    // the country code as defined in css
    // we are currently using `alpha2` as code
    code: PropTypes.string.isRequired
  },

  getDefaultProps: function() {
    return {
      code: 'default'
    };
  },

  render: function() {
    return (
      <div className="flag__container">
        <span className={`flag--${this.props.code}`} />
      </div>
    );
  }
});

export default CountryFlag;
