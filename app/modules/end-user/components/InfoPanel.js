import React, { PropTypes } from 'react';

/**
 * The right side panel used to display details about the selected entity (company, user and so on)
 */
var InfoPanel = React.createClass({
  PropTypes: {
    title: PropTypes.string
  },

  getDefaultProps: function() {
    return {
      title: 'User'
    }
  },

  render: function() {
    return (
      <div className="panel panel--addon">
        <div className="row">
          <div className="large-24 columns">
            <div className="panel--addon__title">
              <h5>{this.props.title}</h5>
            </div>
            <div className="panel--addon__body padding-bottom-reset">
              <ul className="accordion margin-offset">
                {this.props.children}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }
});

export default InfoPanel;
