import _ from 'lodash';
import React from 'react';
import {NavLink} from 'fluxible-router';
import request from 'superagent';

// Components
import CompanyActionBar from  './CompanyActionBar';
import CompanyProfile from './CompanyProfile';
import CompanyService from './CompanyService';
import CompanyWidget from './CompanyWidget';

// Actions
import createCompany from '../actions/createCompany';
import updateCompany from '../actions/updateCompany';

var Company = React.createClass({
  contextTypes: {
    executeAction: React.PropTypes.func.isRequired
  },
  getInitialState: function () {
    return {
      errors: null
    };
  },
  _showDone: function() {

  },
  _showError: function(message) {
    this.setState({
      errors: message
    })
  },
  _handleSaveBtnClick: function() {
    this._handleSubmit();
  },
  _handleSubmit: function() {
    // TODO:
    // replace with context.executeAction
    // extract this onto service layer
    let method = this.props.company._id ? 'put' : 'post';
    let url = this.props.company._id ? `http://localhost:3000/companies/${this.props.company.carrierId}/settings/${this.props.subPage}` : `http://localhost:3000/companies`;

    let form = React.findDOMNode(this.refs.company);
    let formData = new FormData(form);

    request[method](url)
      .send(formData)
      .end((err, res)=>{
        let error = err || res.body.errors;
        if (error) return this._showError(error);
        let company = res.body.company;
        if (!this.props.company._id){
          this.context.executeAction(createCompany, company);
        } else {
          this.context.executeAction(updateCompany, company);
        }
      })
  },
  _handleDataChange: function(errors) {
    this.setState({
      errors: errors
    });
  },
  render: function() {
    if (!this.props.company) return <div></div>;

    let subPageComponent = <CompanyProfile {...this.props.company} ref="company" onDataChange={this._handleDataChange}/>;

    switch (this.props.subPage) {
      case 'profile':
        subPageComponent = <CompanyProfile {...this.props.company} ref="company" onDataChange={this._handleDataChange}/>;
        break;
      case 'service':
        subPageComponent = <CompanyService {...this.props.company} ref="company" onDataChange={this._handleDataChange}/>;
        break;
      case 'widget':
        subPageComponent = <CompanyWidget {...this.props.company} ref="company" onDataChange={this._handleDataChange}/>;
        break;
    }

    return (
      <div className="row">
        <CompanyActionBar _id={this.props.company._id} carrierId={this.props.company.carrierId} errors={this.state.errors} onSaveClick={this._handleSaveBtnClick} />
        {subPageComponent}
      </div>
    );
  }
});

export default Company;
