import React, { PropTypes } from 'react';

export default React.createClass({
  displayName: 'FormField',

  propTypes: {
    label: PropTypes.string,
    leftColumns: PropTypes.string,
    rightColumns: PropTypes.string,
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.array,
    ]),
  },

  contextTypes: {
    router: React.PropTypes.func.isRequired,
  },

  getDefaultProps() {
    return {
      leftColumns: '7',
      rightColumns: '17',
    };
  },

  render() {
    return (
      <div className="row">
        <div className={`large-${this.props.leftColumns} columns`}>
          <label>{this.props.label}</label>
        </div>

        <div className={`large-${this.props.rightColumns} columns`}>
          {this.props.children}
        </div>
      </div>
    );
  },
});
