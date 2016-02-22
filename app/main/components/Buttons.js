import React, { PropTypes } from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';

/**
 * @class CircleButton
 * @classdesc to create a circular button which accept
 * EITHER text OR icon
 */
let CircleButton = React.createClass({
  PropTypes: {
    // name of the route to link to, or a full URL
    // that would serve as prop of `to` for Link of react-router
    to: PropTypes.string,

    // An object of the names/values that correspond with dynamic segments
    // that would serve as prop of `params` for Link of react-router
    params: PropTypes.object,

    // An object of the names/values that will become the query parameters
    // that would serve as prop of `query` for Link of react-router
    query: PropTypes.object,

    // title of button
    // if this is not null, this text will be displayed inside the button
    // and icon will be ignored
    title: PropTypes.string,

    // class name of icon
    // if this is not null, an icon will be displayed inside the button
    icon: PropTypes.string,
    onClick: PropTypes.func.isRequired
  },

  getDefaultProps: function() {
    return {
      to: null,
      params: null,
      query: null,
      title: null,
      icon: null
    };
  },

  render: function() {
    return (
      <If condition={!!this.props.to}>
        <div role="button" className={classNames('button', 'button--circle', { 'button--circle--text': !!this.props.title })} onClick={this.props.onClick}>
          <Link to={this.props.to} params={this.props.params} query={this.props.query}>
            <If condition={!!this.props.title}>
              <span>{this.props.title}</span>
            <Else />
              <If condition={!!this.props.icon}>
                <span className={this.props.icon} />
              </If>
            </If>
          </Link>
        </div>
      <Else />
        <div role="button" className={classNames('button', 'button--circle', { 'button--circle--text': !!this.props.title })} onClick={this.props.onClick}>
          <If condition={!!this.props.title}>
            <span>{this.props.title}</span>
          <Else />
            <If condition={!!this.props.icon}>
              <span className={this.props.icon} />
            </If>
          </If>
        </div>
      </If>
    );
  }
});

export {
  CircleButton
};
