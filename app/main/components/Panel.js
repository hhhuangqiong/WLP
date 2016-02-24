import React, { PropTypes } from 'react';
import classNames from 'classnames';

const Panel = React.createClass({
  propTypes: {
    // to set if this is an add-on panel
    // so far we have only two types of panel
    // so a boolean is used instead of enum
    addOn: PropTypes.bool,
    children: PropTypes.element.isRequired,
  },

  getDefaultProps() {
    return {
      addOn: false,
    };
  },

  render() {
    return (
      <div className={classNames('panel', { 'panel--addon': this.props.addOn })}>
        {this.props.children}
      </div>
    );
  },
});

const PanelHeader = React.createClass({
  propTypes: {
    customClass: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array,
    ]),
    title: PropTypes.string.isRequired,
    children: PropTypes.element.isRequired,
    caption: PropTypes.string.isRequired,
  },
  render() {
    return (
        <div className={classNames('header', 'inline-with-space', this.props.customClass)}>
          <div className="inline-container">
            <h4 className="title inline">
              {this.props.title}
            </h4>
            <If condition={!!this.props.caption}>
              <span className="caption inline">{this.props.caption}</span>
            </If>
          </div>

          <div className="inline-with-space">{this.props.children}</div>
        </div>
    );
  },
});

const PanelBody = React.createClass({
  propTypes: {
    customClass: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array,
    ]),
    children: PropTypes.element.isRequired,
  },

  render() {
    return (
      <div className={classNames('body', this.props.customClass)}>
        {this.props.children}
      </div>
    );
  },
});

export {
  Panel as Wrapper,
  PanelHeader as Header,
  PanelBody as Body,
};
