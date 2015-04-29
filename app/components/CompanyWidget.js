import _ from 'lodash';
import React from 'react';
import {FluxibleMixin} from 'fluxible';
import classNames from 'classnames';

import OverviewWidget from 'app/components/CompanyWidgetOverview';
import StoresWidget from 'app/components/CompanyWidgetStores';
import CallsWidget from 'app/components/CompanyWidgetCalls';
import IMWidget from 'app/components/CompanyWidgetIM';

import CompanyStore from 'app/stores/CompanyStore';

var CompanyWidget = React.createClass({
  mixins: [FluxibleMixin],
  statics: {
    storeListeners: [CompanyStore]
  },
  getInitialState: function() {
    return {
      currentTab: 'overview'
    };
  },
  onChange: function() {

  },
  _handleTabChange: function(tab) {
    this.setState({
      currentTab: tab
    });
  },
  render: function() {

    let widget = <OverviewWidget/>;

    switch (this.state.currentTab) {
      case 'overview':
        widget = <OverviewWidget/>;
        break;
      case 'stores':
        widget = <StoresWidget/>;
        break;
      case 'calls':
        widget = <CallsWidget/>;
        break;
      case 'im':
        widget = <IMWidget/>;
        break;
    }

    return (
      <div className="large-15 large-centered columns">
        <div className="contents-panel">
          <div className="row">
            <div className="large-24 columns">
              <div className="contents-panel__title">
                <ul className="tab-panel row">
                  <li className={classNames('left', {active: this.state.currentTab == 'overview'})} onClick={_.bindKey(this, '_handleTabChange', 'overview')}>overivew</li>
                  <li className={classNames('left', {active: this.state.currentTab == 'stores'})} onClick={_.bindKey(this, '_handleTabChange', 'stores')}>stores</li>
                  <li className={classNames('left', {active: this.state.currentTab == 'calls'})} onClick={_.bindKey(this, '_handleTabChange', 'calls')}>calls</li>
                  <li className={classNames('left', {active: this.state.currentTab == 'im'})} onClick={_.bindKey(this, '_handleTabChange', 'im')}>im</li>
                </ul>
              </div>
            </div>
            {widget}
          </div>
        </div>
      </div>
    )
  }
});

export default CompanyWidget;
