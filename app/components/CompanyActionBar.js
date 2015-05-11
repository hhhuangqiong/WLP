import React from 'react';
import classNames from 'classnames';
import {NavLink} from 'fluxible-router';

var CompanyActionBar = React.createClass({
  render: function() {
    // for create company
    if (!this.props._id) {
      return (
        <nav className="top-bar top-bar--inner" data-topbar role="navigation">
          <section className="top-bar-section">
            <ul className="left top-bar--inner tab--inverted">
              <li className="top-bar--inner tab--inverted__title">
                <a href="javascript:void(0)">company profile</a>
              </li>
            </ul>
            <ul className="right">
              <li><button className="company-action-bar__button">cancel</button></li>
              <li>
                <button
                  className={classNames('company-action-bar__button', {disable: this.props.errors})}
                  onClick={this.props.onSaveClick}
                >
                  create
                </button>
              </li>
            </ul>
          </section>
        </nav>
      )
    } else {
      return (
        <nav className="top-bar top-bar--inner" data-topbar role="navigation">
          <section className="top-bar-section">
            <ul className="left top-bar--inner tab--inverted">
              <li className="top-bar--inner tab--inverted__title">
                <NavLink routeName="adminCompany" navParams={{carrierId: this.props.carrierId, subPage: 'profile'}}>company profile</NavLink>
              </li>
              <li className="top-bar--inner tab--inverted__title">
                <NavLink routeName="adminCompany" navParams={{carrierId: this.props.carrierId, subPage: 'service'}}>service config</NavLink>
              </li>
              <li className="top-bar--inner tab--inverted__title">
                <NavLink routeName="adminCompany" navParams={{carrierId: this.props.carrierId, subPage: 'widget'}}>widget config</NavLink>
              </li>
            </ul>
            <ul className="right">
              <li>
                <button
                  className={classNames('company-action-bar__button', {disable: !this.props.errors})}
                  onClick={this.props.onSaveClick}
                >
                  save
                </button>
              </li>
            </ul>
          </section>
        </nav>
      );
    }
  }
});

export default CompanyActionBar;
