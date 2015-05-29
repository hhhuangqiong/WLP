import _                  from 'lodash';
import React              from 'react';
import FluxibleMixin      from 'fluxible/addons/FluxibleMixin';
import {RouteHandler}     from 'react-router';
import SystemMessage      from './SystemMessage';
import Modal              from '../Modal';

var Public = React.createClass({
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
            <div className="panel panel--extra">
              <div className="row">
                <div className="large-24 columns">
                  <RouteHandler/>
                </div>
                <Modal/>
              </div>
            </div>
          </div>
        </div>
        <SystemMessage />
      </div>
    );
  }
});

export default Public;
