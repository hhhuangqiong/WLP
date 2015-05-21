import React from 'react';
import classNames from 'classnames';
import {Link} from 'react-router';

var CompanyActionBar = React.createClass({
  contextTypes: {
    router: React.PropTypes.func.isRequired
  },

  render: function() {
    let navParams = this.context.router.getCurrentParams();
    let role = navParams.role || null;
    let identity = navParams.identity || null;
    let carrierId = navParams.carrierId || null;

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
              <li>
                <button
                  className={classNames('company-action-bar__button', {disable: this.props.errors})}
                  onClick={this.props.onSave}
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
                <Link to="company-profile" params={{ role: role, identity: identity, carrierId: carrierId }}>company profile</Link>
              </li>
              <li className="top-bar--inner tab--inverted__title">
                <Link to="company-service" params={{ role: role, identity: identity, carrierId: carrierId }}>service config</Link>
              </li>
              <li className="top-bar--inner tab--inverted__title">
                <Link to="company-widget" params={{ role: role, identity: identity, carrierId: carrierId }}>widget config</Link>
              </li>
            </ul>
            <ul className="right">
              <li>
                <button className="hide" onClick={this.props.onToggleActivate}>deactivate</button>
              </li>
              <li>
                <button className="hide" onClick={this.props.onDelete}>delete</button>
              </li>
              <li>
                <button className={classNames('company-action-bar__button', 'hide')} onClick={this.props.onDiscard}>
                  discard
                </button>
              </li>
              <li>
                <button className={classNames('company-action-bar__button', {disable: !this.props.errors})} onClick={this.props.onSave}>
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
