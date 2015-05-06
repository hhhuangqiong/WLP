import React from 'react';
import classNames from 'classnames';

var CompanyServiceiOS = React.createClass({
  render: function() {
    return (
      <div className={classNames({'hide': this.props.isHidden})}>
        <div className="large-24 columns">
          <div className="large-9 columns">
            <label>application name</label>
          </div>
          <div className="large-15 columns">
            <input
              type="text" name="ios-application-name" placeholder="application name"
              value={this.props.applicationName}
              onChange={this.props.onDataChange}
              onBlur={this.props.onDataChanged}
            />
          </div>
        </div>
        <div className="large-24 columns">
          <div className="large-9 columns">
            <label>application key</label>
          </div>
          <div className="large-15 columns">
            <input
              type="text" name="ios-application-key" placeholder="application key" readOnly
            />
          </div>
        </div>
        <div className="large-24 columns">
          <div className="large-9 columns">
            <label>application secret</label>
          </div>
          <div className="large-15 columns">
            <input
              type="text" name="ios-application-secret" placeholder="application secret" readOnly
            />
          </div>
        </div>
      </div>
    )
  }
});

export default CompanyServiceiOS;
