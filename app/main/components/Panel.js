import _ from 'lodash';
import React, { PropTypes } from 'react';
import classNames from 'classnames';

let Panel = React.createClass({
  PropTypes: {
    // to set if this is an add-on panel
    // so far we have only two types of panel
    // so a boolean is used instead of enum
    addOn: PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      addOn: false
    };
  },

  render: function() {
    return (
      <div className={classNames('panel', { 'panel--addon': this.props.addOn })}>
        {this.props.children}
      </div>
    );
  }
});

let PanelHeader = React.createClass({
  PropTypes: {
    title: PropTypes.string.isRequired
  },

  getDefaultProps: function() {
    return {
      title: 'panel header'
    }
  },

  render: function() {
    return (
      <div className="header">
        <If condition={!!this.props.title}>
          <h4 className="title">{this.props.title}</h4>
        </If>
        {this.props.children}
      </div>
    )
  }
});

let PanelBody = React.createClass({
  render: function() {
    return (
      <div className="body">
        {this.props.children}
      </div>
    )
  }
});

export {
  Panel as Wrapper,
  PanelHeader as Header,
  PanelBody as Body
};
