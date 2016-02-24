import _ from 'lodash';
import classNames from 'classnames';
import React, { PropTypes } from 'react';
import Invariant from 'react/lib/invariant';

/**
 * @class Tab
 * @classdesc to create a tab wrapper
 * @throws {Invariant} will throw error if it contains no children
 * @throws {Invariant} will throw error if this.props.children
 * is not TabPanel component
 */
const Tab = React.createClass({
  displayName: 'Tab',

  propTypes: {
    children: PropTypes.arrayOf(PropTypes.element)
  },

  componentWillMount() {
    Invariant(
      React.Children.count(this.props.children) > 0,
      'Tab should contain at least one child of TabPanel component'
    );

    React.Children.map(this.props.children, (child) => {
      if (child.type) {
        Invariant(
          child.type.displayName === 'TabPanel',
          'Tab should only contain TabPanel component(s)'
        );
      }
    });
  },

  getInitialState() {
    return {
      currentTabIndex: 0,
    };
  },

  _isTabActive(index) {
    return this.state.currentTabIndex === index;
  },

  _switchTab(index) {
    this.setState({
      currentTabIndex: index,
    });
  },

  render() {
    return (
      <div className="inner-wrap">
        <div className="large-24 columns">
          <TabList>
            {
              React.Children.map(this.props.children, ({ props }, index) => {
                return (
                  <TabButton
                      title={ props.title }
                      isActive={ this._isTabActive(index) }
                      onClick={ _.bindKey(this, '_switchTab', index) }
                    />
                );
              })
            }
          </TabList>
          {
            React.Children.map(this.props.children, (child, index) => {
              return React.addons.cloneWithProps(child, { isActive: this._isTabActive(index) });
            })
          }
        </div>
      </div>
    );
  },
});

/**
 * @class TabList
 * @classdesc to create a wrapper for tab buttons
 */
const TabList = React.createClass({
  displayName: 'TabList',

  render() {
    return (
      <div className="row">
        <ul className="tab">
          { this.props.children }
        </ul>
      </div>
    );
  },
});


/**
 * @class TabButton
 * @classdesc to create a tab button which is to
 * trigger the active/inactive state of TabPanel
 */
let TabButton = React.createClass({
  displayName: 'TabButton',

  PropTypes: {
    // inherits from TabPanel component which
    // will be shown as title of the button
    title: PropTypes.string.isRequired,
    isActive: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired
  },

  getDefaultProps: function () {
    return {
      title: 'tab',
      isActive: false
    };
  },

  render: function () {
    return (
      <li className="tab__title">
        <a className={classNames({ active: this.props.isActive })} onClick={ this.props.onClick }>
          { this.props.title }
        </a>
      </li>
    );
  }
});

/**
 * @class TabPanel
 * @classdesc to create a tab content container
 */
let TabPanel = React.createClass({
  displayName: 'TabPanel',

  PropTypes: {
    // tab title which will be used as prop of `title`
    // in TabButton component
    title: PropTypes.string.isRequired,
    isActive: PropTypes.bool.isRequired
  },

  getDefaultProps: function () {
    return {
      title: 'tab',
      isActive: false
    };
  },

  render: function () {
    return (
      <div className={classNames('row', { hide: !this.props.isActive })}>
        { this.props.children }
      </div>
    );
  }
});

export {
  Tab as Wrapper,
  TabPanel as Panel
};
