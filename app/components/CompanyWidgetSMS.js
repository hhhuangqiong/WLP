import _ from 'lodash';
import React from 'react';
import classNames from 'classnames';

var CompanyWidgetSMS = React.createClass({
  getInitialState: function() {
    let state = {};
    for (let key in this.props.widgets) {
      _.assign(state, {['widget-' + key]: this.props.widgets[key]});
    }
    return state;
  },
  _handleInputChange: function(stateName, e) {
    this.setState({
      [stateName]: e.target.value
    });
  },
  render: function() {
    return (
      <div className={classNames({'hide': this.props.isHidden})}>
        <div className="large-24 columns">
          <p>stores</p>
        </div>
        <div className="large-24 columns">
          <div className="large-9 columns">
            <label>widget 1</label>
          </div>
          <div className="large-15 columns">
            <input
              type="text" name="sms-widget-1" placeholder="url"
              value={this.state['widget-0']}
              onChange={_.bindKey(this, '_handleInputChange', 'widget-0')}
            />
          </div>
        </div>
        <div className="large-24 columns">
          <div className="large-9 columns">
            <label>widget 2</label>
          </div>
          <div className="large-15 columns">
            <input
              type="text" name="sms-widget-2" placeholder="url"
              value={this.state['widget-1']}
              onChange={_.bindKey(this, '_handleInputChange', 'widget-1')}
            />
          </div>
        </div>
        <div className="large-24 columns">
          <div className="large-9 columns">
            <label>widget 3</label>
          </div>
          <div className="large-15 columns">
            <input
              type="text" name="sms-widget-3" placeholder="url"
              value={this.state['widget-2']}
              onChange={_.bindKey(this, '_handleInputChange', 'widget-2')}
            />
          </div>
        </div>
        <div className="large-24 columns">
          <div className="large-9 columns">
            <label>widget 4</label>
          </div>
          <div className="large-15 columns">
            <input
              type="text" name="sms-widget-4" placeholder="url"
              value={this.state['widget-3']}
              onChange={_.bindKey(this, '_handleInputChange', 'widget-3')}
            />
          </div>
        </div>
        <div className="large-24 columns">
          <div className="large-9 columns">
            <label>widget 5</label>
          </div>
          <div className="large-15 columns">
            <input
              type="text" name="sms-widget-5" placeholder="url"
              value={this.state['widget-4']}
              onChange={_.bindKey(this, '_handleInputChange', 'widget-4')}
            />
          </div>
        </div>
        <div className="large-24 columns">
          <div className="large-9 columns">
            <label>widget 6</label>
          </div>
          <div className="large-15 columns">
            <input
              type="text" name="sms-widget-6" placeholder="url"
              value={this.state['widget-5']}
              onChange={_.bindKey(this, '_handleInputChange', 'widget-5')}
            />
          </div>
        </div>
      </div>
    )
  }
});

export default CompanyWidgetSMS;
