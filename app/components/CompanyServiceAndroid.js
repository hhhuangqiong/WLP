import React from 'react';
import classNames from 'classnames';

var CompanyServiceAndroid = React.createClass({
  render: function() {
    return (
      <section className={classNames({'hide': this.props.isHidden})}>
        <div className="row">
          <div className="large-9 columns">
            <label>application name</label>
          </div>
          <div className="large-15 columns">
            <input className="radius"
              type="text" name="android-application-name" placeholder="application name"
              value={this.props.application.name}
              onChange={this.props.onDataChange}
              onBlur={this.props.onDataChanged}
            />
          </div>
        </div>
        <div className="row">
          <div className="large-9 columns">
            <label>application key</label>
          </div>
          <div className="large-15 columns">
            <input className="radius" type="text" name="android-application-key" placeholder="application key" value={this.props.application.applicationKey} readOnly />
          </div>
        </div>
        <div className="row">
          <div className="large-9 columns">
            <label>application secret</label>
          </div>
          <div className="large-15 columns">
            <input className="radius" type="text" name="android-application-secret" placeholder="application secret" value={this.props.application.applicationSecret} readOnly />
          </div>
        </div>
      </section>
    )
  }
});

export default CompanyServiceAndroid;
