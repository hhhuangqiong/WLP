import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';
import { HOME } from '../../server/paths';
import errors from '../../config/errors.json';

let ErrorTemplate = React.createClass({
  PropTypes: {
    code: PropTypes.number.isRequired,
    name: PropTypes.number.isRequired,
    message: PropTypes.number.isRequired
  },

  getDefaultProps: function() {
    return errors['500'];
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
        <div className="public-container large-24 columns">
          <div className="row">
            <div className="large-10 columns large-centered">
              <div className="system-error">
                <div className="large-6 columns text-center">
                  <i className={classNames('system-error__icon', {'icon-error': this.props.code === 401, 'icon-error3': this.props.code === 404, 'icon-error4': this.props.code === 500})} />
                </div>
                <div className="system-error__message large-18 columns">
                  <ul>
                    <li className="error-code">
                      {this.props.code}
                    </li>
                    <li className="error-name">
                      {this.props.name}
                    </li>
                    <li className="error-message">
                      {this.props.message}, click <Link to={HOME}>here</Link> to go back to dashboard
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

let Error = React.createFactory(ErrorTemplate);

export let Error401 = React.createClass({
  render: function() {
    return Error(errors['401']);
  }
});

export let Error404 = React.createClass({
  render: function() {
    return Error(errors['404']);
  }
});

export let Error500 = React.createClass({
  render: function() {
    return Error(errors['500']);
  }
});
