import React, { createClass, PropTypes, Children } from 'react';

const FilterBar = createClass({
  propTypes: {
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.array,
    ]),
  },

  render() {
    return (
      <nav className="top-bar top-bar--inner" data-topbar role="navigation">
        <section className="top-bar-section">
          {this.props.children}
        </section>
      </nav>
    );
  },
});

const FilterBarNavigationItems = createClass({
  propTypes: {
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.array,
    ]),
  },

  render() {
    return (
      <ul className="left top-bar--inner tab--inverted">
        {Children.map(this.props.children, child => {
          return (
            <li className="top-bar--inner tab--inverted__title">{child}</li>
          );
        })}
      </ul>
    );
  },
});

const FilterBarLeftItems = createClass({
  propTypes: {
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.array,
    ]),
  },

  render() {
    return (
      <ul className="left">
        {Children.map(this.props.children, child => <li>{child}</li>)}
      </ul>
    );
  },
});

const FilterBarRightItems = createClass({
  propTypes: {
    children: PropTypes.oneOfType([
      PropTypes.element,
      PropTypes.array,
    ]),
  },

  render() {
    return (
      <ul className="right">
        {Children.map(this.props.children, child => <li>{child}</li>)}
      </ul>
    );
  },
});

export {
  FilterBar as Wrapper,
  FilterBarLeftItems as LeftItems,
  FilterBarRightItems as RightItems,
  FilterBarNavigationItems as NavigationItems,
};
