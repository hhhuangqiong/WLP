import React from 'react';

/**
 * The right side panel used to display details about the selected entity (company, user and so on)
 */
var InfoPanel = React.createClass({
  render: function() {
    return (
      <div className="contents-panel info-panel">
        <div className="row">
          <div className="large-24 columns">
            <div className="info-panel__header">
              <h5 className="info-panel__header__title">{this.props.title}</h5>
            </div>
            {this.props.children}
          </div>
        </div>
      </div>
    )
  }
});

export default InfoPanel;
