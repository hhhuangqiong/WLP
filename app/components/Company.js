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
import {updateProfile, updateServices, updateWidgets} from '../actions/updateCompany';

/**
 * This is a page handler between Companies & Company Profile/Services/Widgets
 * It receives and passes Company Object from Companies to SubPages
 * and it holds the common states and functions that share to SubPages
 *
 */
let Company = React.createClass({
  contextTypes: {
    executeAction: React.PropTypes.func.isRequired
  },
  /**
   * get initial state for Company Details page
   *
   * @returns {Object} initial state Object
   */
  getInitialState: function () {
    return {
      errors: null
    };
  },
  /**
   * show result of form actions
   *
   * @private
   */
  _showDone: function() {

  },
  _showError: function(message) {
    this.setState({
      errors: message
    })
  },
  _handleSubmit: function() {
    // TODO:
    // replace with context.executeAction
    // extract this onto service layer
    let method = this.props.company._id ? 'put' : 'post';
    let url = this.props.company._id ? `/companies/${this.props.company.carrierId}/settings/${this.props.subPage}` : `/companies`;

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
          this.context.executeAction(updateProfile, company);
        }
      })
  },
  _handleCarrierIdChange: function(e) {
    let carrierId = e.target.value.trim();

    if (carrierId != this.state.carrierId) {
      // make an api call for application ID
      request
        .get(`/companies/${carrierId}/applications`)
        .end((err, res)=>{
          if (err || res.error) {
            // show errors
          }

          // use merge here as it would not merge undefined values
          let payload = _.merge(res.body, { _id: this.props.company._id });

          if (!this.props.company._id) {
            // just for validation check when creating a company
          } else {
            this.context.executeAction(updateServices, payload);
          }
        });

      this.setState({
        carrierId: carrierId
      });
    }
  },
  _handleDataChange: function(errors) {
    this.setState({
      errors: errors
    });
  },
  render: function() {
    if (!this.props.company) return <div></div>;

    // temporarily, will externalize
    let Error404 = <div>Temp 404 Component</div>;
    let subPageComponent = Error404;

    switch (this.props.subPage) {
      case 'profile':
        subPageComponent = <CompanyProfile {...this.props.company} ref="company" onDataChange={this._handleDataChange} onCarrierIdChange={this._handleCarrierIdChange}/>;
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
        <CompanyActionBar
          _id={this.props.company._id}
          carrierId={this.props.company.carrierId}
          errors={this.state.errors}
          onSaveClick={this._handleSubmit}
        />
        {subPageComponent}
      </div>
    );
  }
});

export default Company;
