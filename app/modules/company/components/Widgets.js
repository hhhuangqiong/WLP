import _ from 'lodash';
import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';
import ValidationMixin from 'react-validation-mixin';

import updateWidget from '../actions/updateWidget';

import Tooltip from 'rc-tooltip';
import TopBar from './TopBar';
import Widget from './Widget';
import * as Tab from '../../../main/components/Tab';
import * as Panel from '../../../main/components/Panel';
import CompanyStore from '../stores/CompanyStore';
import config from '../../../config';

const { WIDGETS: sections } = config;

const CompanyWidget = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired,
  },

  mixins: [FluxibleMixin, ValidationMixin],

  statics: {
    storeListeners: [CompanyStore],
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
      .router
      .getCurrentParams();

    const { _id, status, widgets } = this.getStore(CompanyStore).getCompanyByCarrierId(carrierId);
    return { _id, status, data: _.extend(this._getDefaultState(sections), widgets) };
  },

  // expose from ValidationMixin
  getValidatorData() {
    return _.reduce(this.refs, (rules, component) => {
      _.merge(rules, _.isFunction(component.getValidatorData) && component.getValidatorData());
      return rules;
    }, {});
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
          <input type="hidden" name="_id" value={this.state._id} />
          <div className="large-18 large-centered columns">
            <Panel.Wrapper>
              <Panel.Body>
                <Tab.Wrapper>
                  {_.map(sections, ({ NUMBER_OF_WIDGETS: numberOfWidgets }, key) => {
                    const section = key.toLowerCase();

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
  },

  // expose from ValidationMixin
  validatorTypes() {
    return _.reduce(this.refs, (rules, component) => {
      _.merge(rules, _.isFunction(component.getValidatorTypes) && component.getValidatorTypes());
      return rules;
    }, {});
  },

  _getDefaultState(sections) {
    return _.reduce(sections, (result, sectionObj, sectionKey) => {
      const key = sectionKey.toLowerCase();
      result[key] = [];
      return result;
    }, {});
  },

  _handleSubmit() {
    this.validate(error => {
      // react-validation-mixin will trigger changes in
      // this.state.errors upon this.validate() is called
      // so no error handling is needed
      if (error) return;

      const { carrierId } = this
        .context
        .router
        .getCurrentParams();

      const form = React.findDOMNode(this.refs.companyForm);
      const formData = new FormData(form);

      this.context.executeAction(updateWidget, { data: formData, carrierId });
    });
  },

  _handleInputChange(widgetName, stateName, e) {
    this.setState({
      data: _.assign(
        this.state.data,
        { [widgetName]: _.assign(this.state.data[widgetName], { [stateName]: e.target.value }) }
      ),
    });
  },

  _handleInputBlur(e) {
    this.validate(e.target.name);
  },

  _renderHelpText(message) {
    return (
      <Tooltip overlay={message}>
        <a href="#" className="field-set--indicator"><span className="icon-error6" /></a>
      </Tooltip>
    );
  },
});

export default CompanyWidget;
