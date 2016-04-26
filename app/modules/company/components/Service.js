import _ from 'lodash';
import React from 'react';
import { FluxibleMixin } from 'fluxible-addons-react';
import ValidationMixin from 'react-validation-mixin';

import updateCompanyService from '../actions/updateCompanyService';

import Tooltip from 'rc-tooltip';
import TopBar from './TopBar';
import IOSApplication from './ApplicationiOS';
import AndroidApplication from './ApplicationAndroid';
import * as Panel from '../../../main/components/Panel';
import * as InputGroup from '../../../main/components/InputGroup';
import * as Tab from '../../../main/components/Tab';

import fetchCompanyService from '../actions/fetchCompanyService';

import CompanyStore from '../stores/CompanyStore';

const defaultState = {
  serviceConfig: {
    developerKey: null,
    developerSecret: null,
    applicationId: null,
    applications: {
      ios: {
        name: null,
        applicationKey: null,
        applicationSecret: null,
      },
      android: {
        name: null,
        applicationKey: null,
        applicationSecret: null,
      },
    },
  },
};

const CompanyService = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired,
  },

  mixins: [FluxibleMixin, ValidationMixin],

  statics: {
    storeListeners: [CompanyStore],

    fetchData(context, params) {
      context.executeAction(fetchCompanyService, { carrierId: params.carrierId });
    },
  },

  getInitialState() {
    return this.getStateFromStores();
  },

  onChange() {
    this.setState(this.getStateFromStores());
  },

  getStateFromStores() {
    const { carrierId } = this
      .context
      .params;

    const {
      _id,
      status,
      serviceConfig,
    } = this.getStore(CompanyStore).getCompanyByCarrierId(carrierId);

    return { _id, status, serviceConfig: _.merge(_.clone(defaultState), serviceConfig) };
  },

  // expose from ValidationMixin
  getValidatorData() {
    return _.reduce(this.refs, (rules, component) => {
      _.merge(rules, _.isFunction(component.getValidatorData) && component.getValidatorData());
      return rules;
    }, {});
  },

  // TODO: it should be included in the Company Object returned from MongoDB
  getServiceType(carrierId) {
    return carrierId && carrierId.indexOf('.m800-api.com') > -1 ? 'sdk' : 'wl';
  },

  // expose from ValidationMixin
  validatorTypes() {
    return _.reduce(this.refs, (rules, component) => {
      _.merge(rules, _.isFunction(component.getValidatorTypes) && component.getValidatorTypes());
      return rules;
    }, {});
  },

  _handleInputChange(platformName, e) {
    this.setState({
      serviceConfig: {
        applicationId: this.state.serviceConfig.applicationId,
        developerKey: this.state.serviceConfig.developerKey,
        developerSecret: this.state.serviceConfig.developerSecret,
        applications: _.merge(
          this.state.serviceConfig.applications,
          { [platformName]: { name: e.target.value } }
        ),
      },
    });
  },

  _handleInputBlur(e) {
    const inputName = e.target.name;
    this.validate(inputName);
  },

  _handleSubmit() {
    this.validate(error => {
      // react-validation-mixin will trigger changes in
      // this.state.errors upon this.validate() is called
      // so no error handling is needed
      if (error) return;

      const { carrierId } = this
        .context
        .params;

      const form = React.findDOMNode(this.refs.companyForm);
      const formData = new FormData(form);

      this.context.executeAction(updateCompanyService, { carrierId, data: formData });
    });
  },

  _renderHelpText(message) {
    return (
      <Tooltip placement="left" overlay={message}>
        <a href="#" className="field-set--indicator"><span className="icon-error6" /></a>
      </Tooltip>
    );
  },

  render() {
    return (
      <div>
        <TopBar
          _id={this.state._id}
          status={this.state.status}
          hasError={!this.isValid()}
          onSave={this._handleSubmit}
        />
        <form ref="companyForm" onSubmit={this._handleSubmit}>
          <If condition={this.state._id}>
            <input type="hidden" name="_id" value={this.state._id} />
          </If>
          <div className="large-24 columns">
            <Panel.Wrapper>
              <Panel.Header title="service config information" />
              <Panel.Body>
                <InputGroup.Row>
                  <InputGroup.Label htmlFor="applicationId">application ID</InputGroup.Label>
                  <InputGroup.Input>
                    <input
                      className="radius"
                      type="text" name="applicationId"
                      value={this.state.serviceConfig.applicationId}
                      readOnly
                    />
                  </InputGroup.Input>
                </InputGroup.Row>
                <InputGroup.Row>
                  <InputGroup.Label htmlFor="developerKey">developer key</InputGroup.Label>
                  <InputGroup.Input>
                    <input
                      className="radius"
                      type="text"
                      name="developerKey"
                      value={this.state.serviceConfig.developerKey}
                      readOnly
                    />
                  </InputGroup.Input>
                </InputGroup.Row>
                <InputGroup.Row>
                  <InputGroup.Label htmlFor="developerSecret">developer secret</InputGroup.Label>
                  <InputGroup.Input>
                    <input
                      className="radius"
                      type="text"
                      name="developerSecret"
                      value={this.state.serviceConfig.developerSecret}
                      readOnly
                    />
                  </InputGroup.Input>
                </InputGroup.Row>
              </Panel.Body>
              <Panel.Body>
                <Tab.Wrapper>
                  <Tab.Panel title="iOS">
                    <IOSApplication
                      ref="iosApplication"
                      application={
                        this
                          .state
                          .serviceConfig
                          .applications &&
                        this
                          .state
                          .serviceConfig
                          .applications
                          .ios
                      }
                      onDataChange={_.bindKey(this, '_handleInputChange', 'ios')}
                      onInputBlur={this._handleInputBlur}
                      getValidationMessages={this.getValidationMessages}
                      renderHelpText={this._renderHelpText}
                    />
                  </Tab.Panel>
                  <Tab.Panel title="Android">
                    <AndroidApplication
                      ref="androidApplication"
                      application={
                        this
                          .state
                          .serviceConfig
                          .applications &&
                        this
                          .state
                          .serviceConfig
                          .applications.android
                      }
                      onDataChange={_.bindKey(this, '_handleInputChange', 'android')}
                      onInputBlur={this._handleInputBlur}
                      getValidationMessages={this.getValidationMessages}
                      renderHelpText={this._renderHelpText}
                    />
                  </Tab.Panel>
                </Tab.Wrapper>
              </Panel.Body>
            </Panel.Wrapper>
          </div>
        </form>
      </div>
    );
  },
});

export default CompanyService;
