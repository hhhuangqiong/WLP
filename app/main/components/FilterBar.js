import React from 'react';

const FilterBar = React.createClass({
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

const FilterBarNavigationItems = React.createClass({
  render() {
    return (
      <ul className="left top-bar--inner tab--inverted">
        {React.Children.map(this.props.children, child => {
          return (
            <li className="top-bar--inner tab--inverted__title">{child}</li>
          );
        })}
      </ul>
    );
  },
});

const FilterBarLeftItems = React.createClass({
  render() {
    return (
      <ul className="left">
        {React.Children.map(this.props.children, child => {
          return (
            <li>{child}</li>
          );
        })}
      </ul>
    );
  },
});

let FilterBarRightItems = React.createClass({
  render: function() {
    return (
      <ul className="right">
        {React.Children.map(this.props.children, (child)=>{
          return (
            <li>{child}</li>
          );
        })}
      </ul>
    );
  }
});

export {
  FilterBar as Wrapper,
  FilterBarLeftItems as LeftItems,
  FilterBarRightItems as RightItems,
  FilterBarNavigationItems as NavigationItems
};
