'use strict';

import React from 'react';

import CompanyActionBar from  'app/components/CompanyActionBar';
import CompanyProfile from 'app/components/CompanyProfile';
import CompanyService from 'app/components/CompanyService';
import CompanyWidget from 'app/components/CompanyWidget';

var Company = React.createClass({
  getInitialState: function () {
    return {};
  },
  render: function() {
    if (!this.props.company) return <div></div>;

    let subPageComponent = <CompanyProfile/>;

    switch (this.props.subPage) {
      case 'service':
        subPageComponent = <CompanyService/>;
        break;
      case 'widget':
        subPageComponent = <CompanyWidget/>;
        break;
    }

    return (
      <div className="row">
        <CompanyActionBar carrierId={this.props.company.carrierId} />
        {subPageComponent}
      </div>
    );
  }
});

export default Company;
