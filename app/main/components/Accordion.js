import React, { PropTypes } from 'react';
import Invariant from 'react/lib/invariant';
import classNames from 'classnames';

/**
 * Creates an Accordion Wrapper
 * @class Accordion
 * @throws {Invariant} this.props.children must be AccordionNavigation
 */
const Accordion = React.createClass({
  displayName: 'AccordionWrapper',

  propTypes: {
    children: PropTypes.arrayOf(PropTypes.element),
    offsetMargin: PropTypes.bool,
  },

  componentWillMount() {
    React.Children.map(this.props.children, (child) => {
      if (child.type) {
        Invariant(
          child.type.displayName === 'AccordionNavigation',
          'Accordion Wrapper should contain only Accordion Navigation component(s)'
        );
      }
    });
  },

  render() {
    return (
      <ul className={
        classNames(
          'accordion',
          { 'margin-offset': this.props.offsetMargin }
        )}
        data-accordion
      >
        {this.props.children}
      </ul>
    );
  },
});

/**
 * Creates an Accordion Navigation
 * @class AccordionNavigation
 * @classdesc This has to be used with and placed within @class Accordion
 *
 * @see {@link http://foundation.zurb.com/docs/components/accordion.html}
 */
const AccordionNavigation = React.createClass({
  displayName: 'AccordionNavigation',

  propTypes: {
    title: PropTypes.string,

    // to determine if a status label
    // would be shown in header
    withStatusLabel: PropTypes.bool,

    // a determinant of the status label
    status: PropTypes.bool,
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.array,
    ]),
  },

  getDefaultProps() {
    return {
      title: 'accordion header',
      withStatusLabel: false,
      status: false,
    };
  },

  getInitialState() {
    return {
      isCollapsed: false,
    };
  },

  _toggleIsCollapsed() {
    this.setState({
      isCollapsed: !this.state.isCollapsed,
    });
  },

  render() {
    return (
      <li
        ref="accordionItem"
        className={classNames(
          'accordion__item',
          { collapsed: this.state.isCollapsed }
        )}
      >
        <a className="accordion__item-head" onClick={this._toggleIsCollapsed}>
          <span>{this.props.title}</span>
          <If condition={this.props.withStatusLabel}>
            <span
              className={classNames(
                'text-center',
                'status-label',
                { 'status-label--success': this.props.status },
                { 'status-label--alert': !this.props.status }
              )}
            >
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
  },
});

export {
  Accordion as Wrapper,
  AccordionNavigation as Navigation,
};
