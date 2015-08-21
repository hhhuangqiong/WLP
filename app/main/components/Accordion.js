import React, { PropTypes } from 'react';
import classNames from 'classnames';

/**
 * Creates an Accordion Wrapper
 * @class Accordion
 */
let Accordion = React.createClass({
  render: function() {
    return (
      <ul className="accordion" data-accordion>
        {this.props.children}
      </ul>
    );
  }
});

/**
 * Creates an Accordion Navigation
 * @class AccodionNavigation
 * @classdesc This has to be used with and placed within @class Accordion
 *
 * @see {@link http://foundation.zurb.com/docs/components/accordion.html}
 */
let AccordionNavigation = React.createClass({
  PropTypes: {
    title: PropTypes.string,
    withStatusLabel: PropTypes.bool,
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
        <a className="accordion__item__head" onClick={this._toggleIsCollapsed}>
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
        <div className="accordion__item__body">
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
