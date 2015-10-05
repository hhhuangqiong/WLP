import _ from 'lodash';
import React, { PropTypes } from 'react';

/**
 * This class is to create an input fieldset following Foundation CSS.
 * This is not universal in nature as it takes care only the usage of
 * White Label Portal.
 *
 * It now supports only Inline Labels.
 * See: http://foundation.zurb.com/docs/components/forms.html#inline-labels
 */

/**
 * @class InputGroup
 * @classdesc to create an input row
 */
let InputGroup = React.createClass({
  render: function() {
    return (
      <div className="row">
        {this.props.children}
      </div>
    );
  }
});

let Label = React.createClass({
  PropTypes: {
    // for attribute for html `label` tag
    for: PropTypes.string
  },

  render: function() {
    return (
      <div className="large-8 columns">
        <label htmlFor={this.props.for}>{this.props.children}</label>
      </div>
    )
  }
});

let Input = React.createClass({
  render: function() {
    return (
      <div className="large-16 columns">
        {this.props.children}
      </div>
    )
  }
});

export {
  InputGroup as Row,
  Label,
  Input
};
