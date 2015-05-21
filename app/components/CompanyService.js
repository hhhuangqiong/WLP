import _ from 'lodash';
import classNames from 'classnames';
import {concurrent} from 'contra';

import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';

import updateCompanyService from '../actions/updateCompanyService';

import CompanyActionBar from '../components/CompanyActionBar';
import IOSApplication from '../components/CompanyServiceiOS';
import AndroidApplication from '../components/CompanyServiceAndroid';
import InfoBlock from '../components/InfoBlock';

import fetchCompanyService from '../actions/fetchCompanyService';

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

const defaultState = {
  serviceConfig: {
    developerKey: null,
    developerSecret: null,
    applicationId: null,
    applications: {
      ios: {
        name: null,
        applicationKey: null,
        applicationSecret: null
      },
      android: {
        name: null,
        applicationKey: null,
        applicationSecret: null
      }
    }
  },
  features: {

  }
};

var CompanyService = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  mixins: [FluxibleMixin],

  statics: {
    storeListeners: [CompanyStore],

    fetchData: function(context, params, query, done) {
      concurrent([
        context.executeAction.bind(context, fetchCompanyService, { carrierId: params.carrierId })
      ], done || function() {});
    }
  },

  /**
   * Construct a features list Object for initial state
   *
   * @param features {Object} features JSON Object
   * @returns {{}} returns constructed features Object
   */
  getFeatures: function(features) {
    let list = {};

    _.forEach(features, (feature, key)=>{
      if (_.first(Object.keys(feature)).toLowerCase() != 'label') {
        _.forEach(feature, (item, itemKey)=>{
          _.merge(list, {[itemKey]: null});
        });
      } else {
        _.merge(list, {[key]: null});
      }
    });

    return list;
  },

  /**
   * Get company service type as a determinant of features
   *
   * @returns {String} returns service type in string to be used as Object Key
   */

  // TODO: it should be included in the Company Object returned from MongoDB
  getServiceType: function(carrierId) {
    return carrierId && carrierId.indexOf('.m800-api.com') > -1 ? 'sdk' : 'wl';
  },

  getStateFromStores: function() {
    let { carrierId } = this.context.router.getCurrentParams();
    let { _id, serviceConfig, features } = this.getStore(CompanyStore).getCompanyByCarrierId(carrierId);

    let defaultFeatures = this.getFeatures(featureList[this.getServiceType(carrierId)]);

    const defaultState = {
      serviceConfig: {
        developerKey: null,
        developerSecret: null,
        applicationId: null,
        ios: {
          name: null,
          applicationKey: null,
          applicationSecret: null
        },
        android: {
          name: null,
          applicationKey: null,
          applicationSecret: null
        }
      },
      features: defaultFeatures
    };

    let dbState = {};

    if (serviceConfig && Object.keys(serviceConfig).length > 0) {
      dbState['serviceConfig'] = serviceConfig;
    }

    if (features && Object.keys(features).length > 0) {
      dbState['features'] = features;
    }

    return {
      _id: _id,
      carrierId: carrierId,
      data: _.extend(defaultState, dbState)
    };
  },

  getInitialState: function() {
    return _.merge(this.getStateFromStores(), { currentTab: 'ios' });
  },

  onChange: function() {
    let state = _.merge(this.getStateFromStores(), { currentTab: this.state.currentTab });
    this.setState(state);
  },

  _handleTabChange: function(tab) {
    this.setState({
      currentTab: tab
    });
  },

  _handleApplicationInputChange: function(platformName, e) {
    this.setState({
      data: {
        serviceConfig: {
          applicationId: this.state.data.serviceConfig.applicationId,
          developerKey: this.state.data.serviceConfig.developerKey,
          developerSecret: this.state.data.serviceConfig.developerSecret,
          applications: _.merge(this.state.data.serviceConfig.applications, {[platformName]: {name: e.target.value}})
        },
        features: this.state.data.features
      }
    });
  },

  _handleApplicationInputBlur: function(platformName, e) {
    this.setState({
      data: {
        serviceConfig: {
          applicationId: this.state.data.serviceConfig.applicationId,
          developerKey: this.state.data.serviceConfig.developerKey,
          developerSecret: this.state.data.serviceConfig.developerSecret,
          applications: _.merge(this.state.data.serviceConfig.applications, {[platformName]: {name: e.target.value.trim()}})
        },
        features: this.state.data.features
      }
    });
  },

  _handleToggleSwitch: function(featureKey) {
    let featureValue = this.state.data.features[featureKey];
    this.setState({
      data: {
        serviceConfig: this.state.data.serviceConfig,
        features: _.assign(this.state.data.features, {[featureKey]: !featureValue})
      }
    });
  },

  _handleSubmit: function() {
    let { carrierId } = this.context.router.getCurrentParams();

    let form = React.findDOMNode(this.refs.companyForm);
    let formData = new FormData(form);

    this.context.executeAction(updateCompanyService, {
      data: formData,
      carrierId: carrierId
    });
  },

  render: function() {
    let { carrierId } = this.context.router.getCurrentParams();
    return (
      <div>
        <CompanyActionBar
          _id={this.state._id}
          carrierId={this.state.carrierId}
          onSave={this._handleSubmit}
          onToggleActivate={function(){}}
          onDelete={function(){}}
          onDiscard={function(){}}
        />
        <form ref="companyForm" onSubmit={this._handleSubmit}>
          <input type="hidden" name="_id" value={this.state._id} />
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
                        <input className="radius" type="text" name="application-id" placeholder="application ID" value={this.state.data.serviceConfig.applicationId} readOnly />
                      </div>
                    </div>
                    <div className="row">
                      <div className="large-9 columns">
                        <label>developer key</label>
                      </div>
                      <div className="large-15 columns">
                        <input className="radius" type="text" name="developer-key" placeholder="developer key" value={this.state.data.serviceConfig.developerKey} readOnly />
                      </div>
                    </div>
                    <div className="row">
                      <div className="large-9 columns">
                        <label>developer secret</label>
                      </div>
                      <div className="large-15 columns">
                        <input className="radius" type="text" name="developer-secret" placeholder="developer secret" value={this.state.data.serviceConfig.developerSecret} readOnly />
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
                      application={this.state.data.serviceConfig.applications.ios}
                      onDataChange={_.bindKey(this, '_handleApplicationInputChange', 'ios')}
                      onDataChanged={_.bindKey(this, '_handleApplicationInputBlur', 'ios')}
                    />
                    <AndroidApplication
                      isHidden={this.state.currentTab != 'android'}
                      application={this.state.data.serviceConfig.applications.android}
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
                      {_.map(featureList[this.getServiceType(carrierId)], (feature, key)=>{
                        if (_.first(Object.keys(feature)).toLowerCase() != 'label') {
                          return (
                            <InfoBlock title={key}>
                              {_.map(feature, (item, itemKey)=>{
                                return (
                                  <FeatureItem
                                    name={itemKey} label={item.label}
                                    checked={this.state.data.features[itemKey]}
                                    onChange={_.bindKey(this, '_handleToggleSwitch', itemKey)}
                                    />
                                );
                              })}
                            </InfoBlock>
                          )
                        } else {
                          return (
                            <InfoBlock title={key}>
                              <FeatureItem
                                name={key} label={feature.label}
                                checked={this.state.data.features[key]}
                                onChange={_.bindKey(this, '_handleToggleSwitch', key)}
                                />
                            </InfoBlock>
                          )
                        }
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    )
  }
});

export default CompanyService;
