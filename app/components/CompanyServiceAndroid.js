import React from 'react';

var CompanyServiceAndroid = React.createClass({
  render: function() {
    return (
      <div>
        <div className="large-24 columns">
          <div className="large-9 columns">
            <label>application name</label>
          </div>
          <div className="large-15 columns">
            <input type="text" name="android-application-name" placeholder="application name" />
          </div>
        </div>
        <div className="large-24 columns">
          <div className="large-9 columns">
            <label>application key</label>
          </div>
          <div className="large-15 columns">
            <input type="text" name="android-application-key" placeholder="application key" />
          </div>
        </div>
        <div className="large-24 columns">
          <div className="large-9 columns">
            <label>application secret</label>
          </div>
          <div className="large-15 columns">
            <input type="text" name="android-application-secret" placeholder="application secret" />
          </div>
        </div>
      </div>
    )
  }
});

export default CompanyServiceAndroid;
