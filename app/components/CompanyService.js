import React from 'react';

var CompanyService = React.createClass({
  getInitialState: function() {
    return {
      currentTab: 'iOS'
    }
  },
  render: function() {
    return (
      <div>
        <div className="large-15 columns">
          <div className="contents-panel">
            <div className="row">
              <div className="large-24 columns">
                <div className="contents-panel__title">
                  <h4>service config information</h4>
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>application ID</label>
                </div>
                <div className="large-15 columns">
                  <input type="text" name="application-id" placeholder="application ID"/>
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>developer key</label>
                </div>
                <div className="large-15 columns">
                  <input type="text" name="developer-key" placeholder="developer key" />
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>developer secret</label>
                </div>
                <div className="large-15 columns">
                  <input type="text" name="developer-secret" placeholder="developer secret" />
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>application name</label>
                </div>
                <div className="large-15 columns">
                  <input type="text" name="ios-application-name" placeholder="application name" />
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>application key</label>
                </div>
                <div className="large-15 columns">
                  <input type="text" name="ios-application-key" placeholder="application key" />
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>application secret</label>
                </div>
                <div className="large-15 columns">
                  <input type="text" name="ios-application-secret" placeholder="application secret" />
                </div>
              </div>
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
          </div>
        </div>
        <div className="large-9 columns">
          <div className="contents-panel info-panel">
            <div className="row">
              <div className="large-24 columns">
                <div className="info-panel__header">
                  <h5 className="info-panel__header__title">contacts</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
});

export default CompanyService;
