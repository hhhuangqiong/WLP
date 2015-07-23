import React, { PropTypes } from 'react';
import Invariant from 'react/lib/invariant';
import classNames from 'classnames';

/**
 * Creates an Accordion Wrapper
 * @class Accordion
 * @throws {Invariant} this.props.children must be AccordionNavigation
 */
let Accordion = React.createClass({
  displayName: 'AccordionWrapper',

  PropTypes: {
    children: PropTypes.arrayOf(PropTypes.element),
    offsetMargin: PropTypes.bool
  },

  componentWillMount: function() {
    React.Children.map(this.props.children, (child) => {
      if (child.type) {
        Invariant(
          child.type.displayName === 'AccordionNavigation',
          'Accordion Wrapper should contain only Accordion Navigation component(s)'
        );
      }
    });
  },

  render: function() {
    return (
      <ul className={classNames('accordion', { 'margin-offset': this.props.offsetMargin })} data-accordion>
        {this.props.children}
      </ul>
    );
  }
});

/**
 * Creates an Accordion Navigation
 * @class AccordionNavigation
 * @classdesc This has to be used with and placed within @class Accordion
 *
 * @see {@link http://foundation.zurb.com/docs/components/accordion.html}
 */
let AccordionNavigation = React.createClass({
  displayName: 'AccordionNavigation',

  PropTypes: {
    title: PropTypes.string,

    // to determine if a status label
    // would be shown in header
    withStatusLabel: PropTypes.bool,

    // a determinant of the status label
    status: PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      title: 'accordion header',
      withStatusLabel: false,
      status: false
    };
  },

  getInitialState: function() {
    return {
      isCollapsed: false
    };
  },

  _toggleIsCollapsed: function() {
    this.setState({
      isCollapsed: !this.state.isCollapsed
    });
  },

  render: function() {
    return (
      <li ref="accordionItem" className={classNames('accordion__item', { collapsed: this.state.isCollapsed })}>
        <a className="accordion__item-head" onClick={this._toggleIsCollapsed}>
          <span>{this.props.title}</span>
          <If condition={this.props.withStatusLabel}>
            <span className={classNames('text-center', 'status-label', {'status-label--success': this.props.status}, {'status-label--alert': !this.props.status})}>
              <If condition={this.props.status}>
                <span className="icon-tick" />
                <Else />
                <span className="icon-error" />
              </If>
            </span>
          </If>
        </a>
        <div className="accordion__item-body">
          {this.props.children}
        </div>
      </li>
    );
  }
});

export {
  Accordion as Wrapper,
  AccordionNavigation as Navigation
};
