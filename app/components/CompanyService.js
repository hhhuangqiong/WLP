import _ from 'lodash';
import React from 'react';
import {FluxibleMixin} from 'fluxible';
import classNames from 'classnames';

import IOSApplication from 'app/components/CompanyServiceiOS';
import AndroidApplication from 'app/components/CompanyServiceAndroid';
import InfoBlock from 'app/components/InfoBlock';

import CompanyStore from 'app/stores/CompanyStore';

var CompanyService = React.createClass({
  mixins: [FluxibleMixin],
  statics: {
    storeListeners: [CompanyStore]
  },
  getInitialState: function() {
    return {
      currentTab: 'ios'
    }
  },
  onChange: function() {

  },
  _handleTabChange: function(tab) {
    this.setState({
      currentTab: tab
    });
  },
  render: function() {

    let application = <IOSApplication/>;

    switch (this.state.currentTab) {
      case 'ios':
        application = <IOSApplication/>;
        break;
      case 'android':
        application = <AndroidApplication/>;
        break;
    }

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
                <div className="contents-panel_subtitle">
                  <h5>general info</h5>
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
                <div className="contents-panel__title">
                  <ul className="tab-panel row">
                    <li className={classNames('left', {active: this.state.currentTab == 'ios'})} onClick={_.bindKey(this, '_handleTabChange', 'ios')}>iOS</li>
                    <li className={classNames('left', {active: this.state.currentTab == 'android'})} onClick={_.bindKey(this, '_handleTabChange', 'android')}>android</li>
                  </ul>
                </div>
              </div>
              <div className="large-24 columns">
                {application}
              </div>
            </div>
          </div>
        </div>
        <div className="large-9 columns">
          <div className="contents-panel info-panel">
            <div className="row">
              <div className="large-24 columns">
                <div className="info-panel__header">
                  <h5 className="info-panel__header__title">features list</h5>
                </div>
                <InfoBlock className="info-panel__block__contents__feature-list" title="common features">
                  <div className="info-panel__block__contents__feature-item">
                    <div className="large-24 columns">
                      <div className="large-17 columns">
                        <span>member matching(visibility)</span>
                      </div>
                      <div className="large-7 columns">
                        <div className="switch round tiny">
                          <input type="radio" name="testGroup" />
                          <label></label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="info-panel__block__contents__feature-item">
                    <div className="large-24 columns">
                      <div className="large-17 columns">
                        <span>FB integration</span>
                      </div>
                      <div className="large-7 columns">
                        <div className="switch round tiny">
                          <input type="radio" name="testGroup" />
                          <label></label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="info-panel__block__contents__feature-item">
                    <div className="large-24 columns">
                      <div className="large-17 columns">
                        <span>friend finding</span>
                      </div>
                      <div className="large-7 columns">
                        <div className="switch round tiny">
                          <input type="radio" name="testGroup" />
                          <label></label>
                        </div>
                      </div>
                    </div>
                  </div>
                </InfoBlock>
                <InfoBlock className="info-panel__block__contents__feature-list" title="other features">
                  <div className="info-panel__block__contents__feature-item">
                    <div className="large-24 columns">
                      <div className="large-17 columns">
                        <span>member matching(visibility)</span>
                      </div>
                      <div className="large-7 columns">
                        <div className="switch round tiny">
                          <input type="radio" name="testGroup" />
                          <label></label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="info-panel__block__contents__feature-item">
                    <div className="large-24 columns">
                      <div className="large-17 columns">
                        <span>FB integration</span>
                      </div>
                      <div className="large-7 columns">
                        <div className="switch round tiny">
                          <input type="radio" name="testGroup" />
                          <label></label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="info-panel__block__contents__feature-item">
                    <div className="large-24 columns">
                      <div className="large-17 columns">
                        <span>friend finding</span>
                      </div>
                      <div className="large-7 columns">
                        <div className="switch round tiny">
                          <input type="radio" name="testGroup" />
                          <label></label>
                        </div>
                      </div>
                    </div>
                  </div>
                </InfoBlock>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
});

export default CompanyService;
