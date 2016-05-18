import React, { PropTypes } from 'react';
import SystemMessage from './SystemMessage';
import LoadingSpinner from './LoadingSpinner';
import LanguageSwitcher from './LanguageSwitcher';

const Public = props => (
  <div className="full-height">
    <nav className="top-bar public-header" data-topbar role="navigation">
      <ul className="title-area public-header__title-area">
        <li className="logo public-header__logo">
          <img className="logo" src="/images/logo-default-m800.png" />
        </li>
      </ul>
      <section className="top-bar-section navigation-bar">
        <ul className="right">
          <li className="navigation-bar__item">
            <LanguageSwitcher />
          </li>
        </ul>
      </section>
    </nav>
    <div className="public-container row">
      <div className="large-8 large-centered columns">
        <div className="panel panel--extra">
          <div className="row">
            <div className="large-24 columns">
              { props.children }
            </div>
          </div>
        </div>
      </div>
    </div>
    <SystemMessage />
    <LoadingSpinner />
  </div>
);

Public.propTypes = {
  children: PropTypes.element,
};

export default Public;
