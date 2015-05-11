import React from 'react';
import {FluxibleMixin} from 'fluxible';

import CompanyStore from '../stores/CompanyStore';

import Company from './Company';
import CompanyList from './CompanyList';

var Companies = React.createClass({
  mixins: [FluxibleMixin],
  statics: {
    storeListeners: [CompanyStore]
  },
  /**
   * get states of Company List and Current Company from CompanyStore
   *
   * @returns {Object}
   */
  getInitialState: function () {
    return this.getStore(CompanyStore).getState();
  },
  /**
   * capture Company Store changes and take effect
   */
  onChange: function() {
    let state = this.getStore(CompanyStore).getState();
    this.setState(state);
  },
  render: function() {

    let subPage = this.props.params ? this.props.params.get('subPage') : null;

    return (
      <div className="row">
        <div className="large-6 columns">
          <CompanyList companies={this.state.companies}/>
        </div>
        <div className="large-18 columns">
          <Company company={this.state.currentCompany} subPage={subPage}/>
        </div>
      </div>
    );
  }
});

export default Companies;
