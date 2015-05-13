import React from 'react';

var InfoItem = React.createClass({
  render: function() {
    return (
    <div className="large-24 columns">
      <div className="row">
        <div className="large-9 columns">
          <label>{this.props.label}</label>
        </div>
        <div className="large-15 columns">
          {this.props.children}
        </div>
      </div>
    </div>
    )
  }
});

export default InfoItem;
