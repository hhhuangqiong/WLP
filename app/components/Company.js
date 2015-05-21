import _ from 'lodash';
import React from 'react';
import {RouteHandler} from 'react-router';

// Components
import CompanyActionBar from  './CompanyActionBar';
import CompanyProfile from './CompanyProfile';
import CompanyService from './CompanyService';
import CompanyWidget from './CompanyWidget';

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
    let form = React.findDOMNode(this.refs.company);
    let formData = new FormData(form);

    if (!this.props.company._id) {
      this.context.executeAction(createCompany, {
        data: formData
      });
    } else {
      this.context.executeAction(updateCompany, {
        data: formData,
        carrierId: this.props.company.carrierId,
        subPage: this.props.subPage
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
        subPageComponent = <CompanyProfile {...this.props.company} ref="company" onDataChange={this._handleDataChange} />;
        break;
      case 'service':
        subPageComponent = <CompanyService {...this.props.company} ref="company" onDataChange={this._handleDataChange} />;
        break;
      case 'widget':
        subPageComponent = <CompanyWidget {...this.props.company} ref="company" onDataChange={this._handleDataChange} />;
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
        <RouteHandler />
      </div>
    );
  }
});

export default Company;
