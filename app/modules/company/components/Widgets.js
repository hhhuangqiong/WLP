import _ from 'lodash';
import classNames from 'classnames';

import React, { PropTypes } from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import ValidationMixin from 'react-validation-mixin';

import updateWidget from '../actions/updateWidget';

import Tooltip from 'rc-tooltip';
import TopBar from './TopBar';
import Widget from './Widget';
import * as Tab from '../../../main/components/Tab';
import * as Panel from '../../../main/components/Panel';
import * as InputGroup from '../../../main/components/InputGroup';

import CompanyStore from '../stores/CompanyStore';

import config from '../../../config';

let { WIDGETS: sections } = config;

let CompanyWidget = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  mixins: [FluxibleMixin, ValidationMixin],

  statics: {
    storeListeners: [CompanyStore]
  },

  _getDefaultState: function(sections) {
    return _.reduce(sections, function(result, sectionObj, sectionKey) {
      let key = sectionKey.toLowerCase();
      result[key] = [];
      return result;
    }, {});
  },

  // expose from ValidationMixin
  validatorTypes: function() {
    return _.reduce(this.refs, function(rules, component) {
      _.merge(rules, _.isFunction(component.getValidatorTypes) && component.getValidatorTypes());
      return rules;
    }, {});
  },

  // expose from ValidationMixin
  getValidatorData: function() {
    return _.reduce(this.refs, function(rules, component) {
      _.merge(rules, _.isFunction(component.getValidatorData) && component.getValidatorData());
      return rules;
    }, {});
  },

  getStateFromStores: function() {
    let { carrierId } = this.context.router.getCurrentParams();
    let { _id, status, widgets } = this.getStore(CompanyStore).getCompanyByCarrierId(carrierId);
    return { _id, status, data: _.extend(this._getDefaultState(sections), widgets) };
  },

  getInitialState: function() {
    return this.getStateFromStores();
  },

  onChange: function() {
    this.setState(this.getStateFromStores());
  },

  _handleSubmit: function() {
    this.validate((error)=> {
      // react-validation-mixin will trigger changes in
      // this.state.errors upon this.validate() is called
      // so no error handling is needed
      if (error)
        return;

      let { carrierId } = this.context.router.getCurrentParams();

      let form = React.findDOMNode(this.refs.companyForm);
      let formData = new FormData(form);

      this.context.executeAction(updateWidget, { data: formData, carrierId });
    });
  },

  _handleInputChange: function(widgetName, stateName, e) {
    this.setState({
      data: _.assign(this.state.data, { [widgetName]: _.assign(this.state.data[widgetName], {[stateName]: e.target.value}) })
    });
  },

  _handleInputBlur: function(e) {
    let inputName = e.target.name;
    this.validate(inputName);
  },

  _renderHelpText: function(message) {
    return (
      <Tooltip overlay={message}>
        <a href="#" className="field-set--indicator"><span className="icon-error6" /></a>
      </Tooltip>
    );
  },

  render: function() {
    return (
      <div>
        <TopBar _id={this.state._id} status={this.state.status} hasError={!this.isValid()} onSave={this._handleSubmit} />
        <form ref="companyForm" onSubmit={this._handleSubmit}>
          <input type="hidden" name="_id" value={this.state._id} />
          <div className="large-18 large-centered columns">
            <Panel.Wrapper>
              <Panel.Body>
                <Tab.Wrapper>
                  {_.map(sections, ({ NUMBER_OF_WIDGETS: numberOfWidgets }, key) => {
                    let section = key.toLowerCase();
                    return (
                      <Tab.Panel title={section}>
                        <Widget
                            ref={section}
                            section={section}
                            widgets={this.state.data[section]}
                            numberOfWidget={numberOfWidgets}
                            onDataChange={this._handleInputChange}
                            onInputBlur={this._handleInputBlur}
                            getValidationMessages={this.getValidationMessages}
                            renderHelpText={this._renderHelpText}
                          />
                      </Tab.Panel>
                    );
                  })}
                </Tab.Wrapper>
              </Panel.Body>
            </Panel.Wrapper>
          </div>
        </form>
      </div>
    );
  }
});

export default CompanyWidget;
