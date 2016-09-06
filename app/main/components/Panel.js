import { isString } from 'lodash';
import React, { PropTypes, isValidElement } from 'react';
import classNames from 'classnames';

const Panel = React.createClass({
  propTypes: {
    // to set if this is an add-on panel
    // so far we have only two types of panel
    // so a boolean is used instead of enum
    addOn: PropTypes.bool,
    children: PropTypes.node.isRequired,
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
    className: PropTypes.string,
    title: PropTypes.string.isRequired,
    children: PropTypes.node,
    caption: PropTypes.oneOfType([
      PropTypes.string.isRequired,
      PropTypes.node.isRequired,
    ]),
  },

  renderCaption(caption) {
    if (isString(caption)) {
      return <span className="caption inline">{caption}</span>;
    }

    if (isValidElement(caption)) {
      return caption;
    }

    return null;
  },

  render() {
    return (
        <div className={
            classNames(
              'header',
              'inline-with-space',
              this.props.customClass,
              this.props.className
            )
          }
        >
          <div className="inline-container">
            <h4 className="title inline">
              {this.props.title}
            </h4>
            {this.renderCaption(this.props.caption)}
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
    className: PropTypes.string,
    children: PropTypes.node,
  },

  render() {
    return (
      <div className={classNames('body', this.props.customClass, this.props.className)}>
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
