import _ from 'lodash';
import React, { PropTypes } from 'react';
import classNames from 'classnames';
import Joi from 'joi';

import * as InputGroup from '../../../main/components/InputGroup';

let Widget = React.createClass({
  PropTypes: {
    section: PropTypes.string.isRequired,
    numberOfWidget: PropTypes.number.isRequired,
    widgets: PropTypes.object,
    onDataChange: PropTypes.func.isRequired,
    onInputBlur: PropTypes.func.isRequired,
    getValidatorMessages: PropTypes.func.isRequired,
    renderHelpText: PropTypes.func.isRequired
  },

  getDefaultProps: function() {
    return {
      section: null,
      numberOfWidget: 0,
      widgets: null
    };
  },

  getValidatorTypes: function() {
    return _.reduce(this._composeWidgetArray(), (result, key) => {
      result[this._getInputName(this.props.section, key)] = Joi.string().regex(/<iframe.+?<\/iframe>/).allow('').allow(null);
      return result;
    }, {});
  },

  getValidatorData: function() {
    return _.reduce(this._composeWidgetArray(), (result, key) => {
      result[this._getInputName(this.props.section, key)] = this.props.widgets[key];
      return result;
    }, {});
  },

  _composeWidgetArray: function() {
    return Array.apply(null, { length: this.props.numberOfWidget }).map(Number.call, Number);
  },

  _getInputName: function(section, key) {
    return `${section}-widget-${key}`;
  },

  render: function() {
    return (
      <div>
        <div className="row">
          <div className="large-24 columns">
          </div>
        </div>
        <For each="key" index="index" of={ this._composeWidgetArray() }>
          <InputGroup.Row>
            <InputGroup.Label for={ this._getInputName(this.props.section, key) }>widget {key}</InputGroup.Label>
            <InputGroup.Input>
              <input
                  className="radius"
                  type="text" name={ this._getInputName(this.props.section, key) } placeholder="url"
                  value={ this.props.widgets[key] }
                  onChange={ _.bindKey(this.props, 'onDataChange', this.props.section, key) }
                  onBlur={ this.props.onInputBlur }
                />
              {this.props.getValidationMessages(this._getInputName(this.props.section, key)).map(this.props.renderHelpText)}
            </InputGroup.Input>
          </InputGroup.Row>
        </For>
      </div>
    )
  }
});

export default Widget;
