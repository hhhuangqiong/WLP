import _ from 'lodash';
import React from 'react';
import classNames from 'classnames';

import OverviewWidget from './CompanyWidgetOverview';
import StoresWidget from './CompanyWidgetStores';
import CallsWidget from './CompanyWidgetCalls';
import IMWidget from './CompanyWidgetIM';

import CompanyStore from '../stores/CompanyStore';

var CompanyWidget = React.createClass({
  getInitialState: function() {
    return {
      currentTab: 'overview',
      _id: this.props._id
    };
  },
  _handleInputChange: function(widgetName, stateName, e) {
    this.setState({
      [widgetName]: _.assign(this.state[widgetName], {[stateName]: e.target.value.trim()})
    });
  },
  _handleTabChange: function(tab) {
    this.setState({
      currentTab: tab
    });
  },
  render: function() {
    return (
      <form ref="companyFrom">
        <input type="hidden" name="_id" value={this.props._id} />
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
              <OverviewWidget
                isHidden={this.state.currentTab != 'overview'}
                widgets={this.props.widgets}
                onDataChange={_.bindKey(this, '_handleInputChange', 'overview')}
              />
              <StoresWidget
                isHidden={this.state.currentTab != 'stores'}
                widgets={this.props.widgets}
                onDataChange={_.bindKey(this, '_handleInputChange', 'stores')}
              />
              <CallsWidget
                isHidden={this.state.currentTab != 'calls'}
                widgets={this.props.widgets}
                onDataChange={_.bindKey(this, '_handleInputChange', 'calls')}
              />
              <IMWidget
                isHidden={this.state.currentTab != 'im'}
                widgets={this.props.widgets}
                onDataChange={_.bindKey(this, '_handleInputChange', 'im')}
              />
            </div>
          </div>
        </div>
      </form>
    )
  }
});

export default CompanyWidget;
