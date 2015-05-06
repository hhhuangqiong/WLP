import _ from 'lodash';
import React from 'react';
import {FluxibleMixin} from 'fluxible';
import classNames from 'classnames';

import IOSApplication from './CompanyServiceiOS';
import AndroidApplication from './CompanyServiceAndroid';
import InfoBlock from './InfoBlock';

import CompanyStore from '../stores/CompanyStore';

var featureList = require('../data/featureList.json');

var FeatureItem = React.createClass({
  render: function() {
    return (
      <div className="info-panel__block__contents__feature-item">
        <div className="large-24 columns">
          <div className="large-17 columns">
            <span>{this.props.label}</span>
          </div>
          <div className="large-7 columns">
            <div className="switch round tiny" onClick={this.props.onChange}>
              <input
                type="radio" name={this.props.name}
                checked={this.props.checked}
              />
              <label></label>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

var CompanyService = React.createClass({
  /**
   * Construct a features list Object for initial state
   *
   * @param features {Object} features JSON Object
   * @returns {{}} returns constructed features Object
   */
  getFeatures: function(features) {
    let list = {};

    _.forEach(features, (feature)=>{
      _.forEach(feature, (item, key)=>{
        _.merge(list, {[key]: this.props.features[key] || false});
      });
    });

    return list;
  },
  /**
   * Get company service type as a determinant of features
   *
   * @returns {String} returns service type in string to be used as Object Key
   */
  getServiceType: function() {
    if (this.props.carrierId.indexOf('.m800-api.com') > -1) {
      return 'SDK';
    } else {
      return 'WL';
    }
  },
  getInitialState: function() {
    return {
      currentTab: 'ios',
      features: this.getFeatures(featureList[this.getServiceType()]),
      serviceConfig: {
        applications: {
          ios: {
            name: this.props.serviceConfig.applications.ios.name || null
          },
          android: {
            name: this.props.serviceConfig.applications.android.name || null
          }
        }
      }
    }
  },
  _handleTabChange: function(tab) {
    this.setState({
      currentTab: tab
    });
  },
  _handleApplicationInputChange: function(platformName, e) {
    this.setState({
      serviceConfig: {
        applications: _.merge(this.state.serviceConfig.applications, {[platformName]: {name: e.target.value}})
      }
    });
  },
  _handleApplicationInputBlur: function(platformName, e) {
    this.setState({
      serviceConfig: {
        applications: _.merge(this.state.serviceConfig.applications, {[platformName]: {name: e.target.value.trim()}})
      }
    });
  },
  _handleToggleSwitch: function(featureKey) {
    let featureValue = this.state.features[featureKey];
    this.setState({
      features: _.assign(this.state.features, {[featureKey]: !featureValue})
    });
  },
  render: function() {

    let application;

    switch (this.state.currentTab) {
      case 'ios':
        application = <IOSApplication name={this.state.serviceConfig.applications.ios.name} onDataChange={_.bindKey(this, '_handleApplicationInputChange', 'ios')}/>;
        break;
      case 'android':
        application = <AndroidApplication name={this.state.serviceConfig.applications.android.name} onDataChange={_.bindKey(this, '_handleApplicationInputChange', 'android')}/>;
        break;
    }

    return (
      <form ref="companyFrom">
        <input type="hidden" name="_id" value={this.props._id} />
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
                  <input
                    type="text" name="application-id" placeholder="application ID" readOnly
                  />
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>developer key</label>
                </div>
                <div className="large-15 columns">
                  <input
                    type="text" name="developer-key" placeholder="developer key" readOnly
                  />
                </div>
              </div>
              <div className="large-24 columns">
                <div className="large-9 columns">
                  <label>developer secret</label>
                </div>
                <div className="large-15 columns">
                  <input
                    type="text" name="developer-secret" placeholder="developer secret" readOnly
                  />
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
                <IOSApplication
                  isHidden={this.state.currentTab != 'ios'}
                  applicationName={this.state.serviceConfig.applications.ios.name}
                  onDataChange={_.bindKey(this, '_handleApplicationInputChange', 'ios')}
                  onDataChanged={_.bindKey(this, '_handleApplicationInputBlur', 'ios')}
                />
                <AndroidApplication
                  isHidden={this.state.currentTab != 'android'}
                  applicationName={this.state.serviceConfig.applications.android.name}
                  onDataChange={_.bindKey(this, '_handleApplicationInputChange', 'android')}
                  onDataChanged={_.bindKey(this, '_handleApplicationInputBlur', 'android')}
                />
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
                {_.map(featureList[this.getServiceType()], (feature, key)=>{
                  return (
                    <InfoBlock className="info-panel__block__contents__feature-list" title={key}>
                      {_.map(feature, (item, itemKey)=>{
                        return (
                          <FeatureItem
                            name={itemKey} label={item.label}
                            checked={this.state.features[itemKey]}
                            onChange={_.bindKey(this, '_handleToggleSwitch', itemKey)}
                          />
                        );
                      })}
                    </InfoBlock>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </form>
    )
  }
});

export default CompanyService;
