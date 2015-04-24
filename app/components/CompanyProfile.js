import React from 'react';

var CompanyProfile = React.createClass({
  render: function() {
    return (
      <div>
        <div className="large-15 columns">
          <div className="contents-panel">
            <div className="row">
              <div className="large-24 columns">
                <div className="contents-panel__title">
                  <h4>basic information</h4>
                </div>
              </div>
              <div className="large-24 columns">
                <div className="contents-panel__logo">
                  i am a logo
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>company name</label>
                </div>
                <div className="large-15 columns">
                  <input type="text" name="company" placeholder="company name" />
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>company address</label>
                </div>
                <div className="large-15 columns">
                  <textarea name="company-address" />
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>company type</label>
                </div>
                <div className="large-15 columns">
                  <input type="text" name="company" placeholder="company name" />
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>parent company</label>
                </div>
                <div className="large-15 columns">
                  <select name="parent-company">
                    <option>please select</option>
                  </select>
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>service type</label>
                </div>
                <div className="large-15 columns">
                  <input type="text" name="company" placeholder="company name" />
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>account manager</label>
                </div>
                <div className="large-15 columns">
                  <input type="text" name="account-manager" placeholder="account manager" />
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>bill code</label>
                </div>
                <div className="large-15 columns">
                  <input type="text" name="bill-code" placeholder="bill code" />
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>category ID</label>
                </div>
                <div className="large-15 columns">
                  <input type="text" name="category-id" placeholder="category ID" />
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>expected service date</label>
                </div>
                <div className="large-15 columns">
                  <input type="text" name="company" placeholder="company name" />
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>country</label>
                </div>
                <div className="large-15 columns">
                  <select name="country">
                    <option>please select</option>
                  </select>
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>timezone</label>
                </div>
                <div className="large-15 columns">
                  <select name="timezone">
                    <option>please select</option>
                  </select>
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

export default CompanyProfile;
