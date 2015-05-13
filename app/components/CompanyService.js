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
      <div className="switch-wrapper">
        <label>{this.props.label}</label>
        <div className="switch round tiny right" onClick={this.props.onChange}>
          <input
            type="radio" name={this.props.name}
            checked={this.props.checked}
          />
          <label></label>
        </div>
      </div>
    );
  }
});

var CompanyService = React.createClass({
  propTypes: {
    currentTab: React.PropTypes.string,
    features: React.PropTypes.object,
    serviceConfig: React.PropTypes.shape({
      applications: React.PropTypes.shape({
        ios: React.PropTypes.shape({
          name: React.PropTypes.string,
          applicationKey: React.PropTypes.string,
          applicationSecret: React.PropTypes.string
        })
      })
    })
  },
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
      serviceConfig: this.props.serviceConfig || {
        applications: {
          ios: {
            name: null,
            applicationKey: null,
            applicationSecret: null
          },
          android: {
            name: null,
            applicationKey: null,
            applicaationSecret: null
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
          <div className="panel">
            <div className="row">
              <div className="large-24 columns">
                <div className="panel__title">
                  <h4>service config information</h4>
                </div>
                <div className="panel__body">
                  <div className="panel__body__subtitle">
                    <h5>general info</h5>
                  </div>
                  <div className="row">
                    <div className="large-9 columns">
                      <label>application ID</label>
                    </div>
                    <div className="large-15 columns">
                      <input className="radius"
                        type="text" name="application-id" placeholder="application ID" readOnly
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="large-9 columns">
                      <label>developer key</label>
                    </div>
                    <div className="large-15 columns">
                      <input className="radius"
                        type="text" name="developer-key" placeholder="developer key" readOnly
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="large-9 columns">
                      <label>developer secret</label>
                    </div>
                    <div className="large-15 columns">
                      <input className="radius"
                        type="text" name="developer-secret" placeholder="developer secret" readOnly
                      />
                    </div>
                  </div>
                </div>
                <div className="panel__body">
                  <ul className="tab">
                    <li className="tab__title">
                      <a className={classNames({active: this.state.currentTab == 'ios'})} onClick={_.bindKey(this, '_handleTabChange', 'ios')}>iOS</a>
                    </li>
                    <li className="tab__title">
                      <a className={classNames({active: this.state.currentTab == 'android'})} onClick={_.bindKey(this, '_handleTabChange', 'android')}>Android</a>
                    </li>
                  </ul>
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
        </div>
        <div className="large-9 columns">
          <div className="panel panel--addon">
            <div className="row">
              <div className="large-24 columns">
                <div className="panel--addon__title">
                  <h5>features list</h5>
                </div>
                <div className="panel--addon__body padding-bottom-reset">
                  <ul className="accordion margin-offset">
                    {_.map(featureList[this.getServiceType()], (feature, key)=>{
                      return (
                        <InfoBlock title={key}>
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
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    )
  }
});

export default CompanyService;
