import React from 'react';
import {NavLink} from 'flux-router-component';

var CompanyActionBar = React.createClass({
  render: function() {
    return (
      <nav className="top-bar company-top-bar" data-topbar role="navigation">
        <section className="top-bar-section">
          <ul className="left company-top-bar__tab-panel">
            <li className="company-top-bar__tab-panel__tab-item">
              <NavLink routeName="adminCompany" navParams={{carrierId: this.props.carrierId}}>company profile</NavLink>
            </li>
            <li className="company-top-bar__tab-panel__tab-item">
              <NavLink routeName="adminCompany" navParams={{carrierId: this.props.carrierId, subPage: 'service'}}>service config</NavLink>
            </li>
            <li className="company-top-bar__tab-panel__tab-item">
              <NavLink routeName="adminCompany" navParams={{carrierId: this.props.carrierId, subPage: 'widget'}}>widget config</NavLink>
            </li>
          </ul>
          <ul className="right">
            <li className="active"><a href="#">Right Button Active</a></li>
          </ul>
        </section>
      </nav>
    );
  }
});

export default CompanyActionBar;
