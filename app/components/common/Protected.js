import React          from 'react';
import classnames     from 'classnames';
import {RouteHandler} from 'react-router';
import Sidebar        from '../Sidebar';
import Navigation     from '../Navigation';

var Protected = React.createClass({
  getInitialState: function() {
    return {
      isOffCanvas: true
    };
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
              <RouteHandler/>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = Protected;
