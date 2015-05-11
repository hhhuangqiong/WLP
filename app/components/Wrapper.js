import React from 'react';
import classnames from 'classnames';

import Sidebar from './Sidebar';
import Navigation from './Navigation';

export var PublicHtml = React.createClass({
  propTypes: {
    children: React.PropTypes.element.isRequired
  },
  render: function() {
    return (
      <div>
        <nav className="top-bar public-header" data-topbar role="navigation">
          <ul className="title-area public-header__title-area">
            <li className="logo public-header__logo">
              <img className="logo" src="/images/logo-default-m800.png" />
            </li>
          </ul>
        </nav>
        <div className="public-container row">
          <div className="large-8 large-centered columns">
            <div className="panel">
              <div className="row">
                <div className="large-24 columns">
                  {this.props.children}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
});

export var AuthenticatedHtml = React.createClass({
  propTypes: {
    children: React.PropTypes.element.isRequired
  },
  getInitialState: function() {
    return {
      isOffCanvas: true
    }
  },
  _setOffCanvas: function(isOffCanvas) {
    this.setState({
      isOffCanvas: isOffCanvas
    })
  },
  render: function() {
    return (
      <div>
        <Sidebar isOffCanvas={this.state.isOffCanvas} handleOffCavnas={this._setOffCanvas} />
        <div className={classnames('content-frame', {offcanvas: this.state.isOffCanvas})}>
          <nav className="top-bar app-header" data-topbar role="navigation">
            <ul className="title-area app-header__title-area">
              <li className="name app-header__title">
                <h1>{this.props.pageTitle}</h1>
              </li>
            </ul>
            <Navigation/>
          </nav>
          <div className="row">
            <div className="large-24 columns">
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    )
  }
});
