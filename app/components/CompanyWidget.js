import _ from 'lodash';
import classNames from 'classnames';

import React from 'react';
import FluxibleMixin from 'fluxible/addons/FluxibleMixin';

import updateCompanyWidget from '../actions/updateCompanyWidget';

import CompanyActionBar from '../components/CompanyActionBar';
import OverviewWidget from '../components/CompanyWidgetOverview';
import StoresWidget from '../components/CompanyWidgetStores';
import CallsWidget from '../components/CompanyWidgetCalls';
import IMWidget from '../components/CompanyWidgetIM';
import SMSWidget from '../components/CompanyWidgetSMS';

import CompanyStore from '../stores/CompanyStore';

const defaultState = {
  overview: [],
  stores: [],
  calls: [],
  im: [],
  sms: []
};

var CompanyWidget = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  mixins: [FluxibleMixin],

  getInitialState: function() {
    let { carrierId } = this.context.router.getCurrentParams();
    let { _id, widgets } = this.getStore(CompanyStore).getCompanyByCarrierId(carrierId);
    return {
      currentTab: 'overview',
      _id: _id,
      carrierId: carrierId,
      data: _.extend(defaultState, widgets)
    };
  },

  _handleSubmit: function() {
    let { carrierId } = this.context.router.getCurrentParams();

    let form = React.findDOMNode(this.refs.companyForm);
    let formData = new FormData(form);

    this.context.executeAction(updateCompanyWidget, {
      data: formData,
      carrierId: carrierId
    });
  },

  _handleInputChange: function(widgetName, stateName, e) {
    this.setState({
      [widgetName]: _.assign(this.state[widgetName], {[stateName]: e.target.value})
    });
  },

  _handleTabChange: function(tab) {
    this.setState({
      currentTab: tab
    });
  },

  render: function() {
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
          <div className="large-16 large-centered columns">
            <div className="panel">
              <div className="row">
                <div className="large-24 columns">
                  <div className="panel__title">
                    <ul className="tab margin-bottom-reset">
                      <li className="tab__title">
                        <a className={classNames({active: this.state.currentTab == 'overview'})} onClick={_.bindKey(this, '_handleTabChange', 'overview')}>overivew</a>
                      </li>
                      <li className="tab__title">
                        <a className={classNames({active: this.state.currentTab == 'stores'})} onClick={_.bindKey(this, '_handleTabChange', 'stores')}>stores</a>
                      </li>
                      <li className="tab__title">
                        <a className={classNames({active: this.state.currentTab == 'calls'})} onClick={_.bindKey(this, '_handleTabChange', 'calls')}>calls</a>
                      </li>
                      <li className="tab__title">
                        <a className={classNames({active: this.state.currentTab == 'im'})} onClick={_.bindKey(this, '_handleTabChange', 'im')}>im</a>
                      </li>
                      <li className="tab__title">
                        <a className={classNames({active: this.state.currentTab == 'sms'})} onClick={_.bindKey(this, '_handleTabChange', 'sms')}>sms</a>
                      </li>
                    </ul>
                  </div>
                  <div className="panel__body">
                    <div className="row">
                      <OverviewWidget
                        isHidden={this.state.currentTab != 'overview'}
                        widgets={this.state.data.overview}
                        onDataChange={_.bindKey(this, '_handleInputChange', 'overview')}
                      />
                      <StoresWidget
                        isHidden={this.state.currentTab != 'stores'}
                        widgets={this.state.data.stores}
                        onDataChange={_.bindKey(this, '_handleInputChange', 'stores')}
                      />
                      <CallsWidget
                        isHidden={this.state.currentTab != 'calls'}
                        widgets={this.state.data.calls}
                        onDataChange={_.bindKey(this, '_handleInputChange', 'calls')}
                      />
                      <IMWidget
                        isHidden={this.state.currentTab != 'im'}
                        widgets={this.state.data.im}
                        onDataChange={_.bindKey(this, '_handleInputChange', 'im')}
                      />
                      <SMSWidget
                        isHidden={this.state.currentTab != 'sms'}
                        widgets={this.state.data.sms}
                        onDataChange={_.bindKey(this, '_handleInputChange', 'sms')}
                      />
                    </div>
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

export default CompanyWidget;
