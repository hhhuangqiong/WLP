import React, { createClass, PropTypes } from 'react';

const DEFAULT_CODE = 'default';

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
const CountryFlag = createClass({
  propTypes: {
    // the country code as defined in css
    // we are currently using `alpha2` as code
    code: PropTypes.string.isRequired,
    className: PropTypes.string,
  },

  render() {
    if (!this.props.code) return null;

    return (
      <div className={`flag__container ${this.props.className}`}>
        <span className={`flag--${(this.props.code || DEFAULT_CODE).toLowerCase()}`} />
      </div>
    );
  },
});

export default CountryFlag;
