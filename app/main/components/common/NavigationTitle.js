import React from 'react';

const NavigationTitle = React.createClass({
  render() {
    return (
      <ul className="title-area app-header__title-area">
        <li className="name app-header__title">
          <h1>{this.props.title}</h1>
        </li>
      </ul>
    );
  },
});

export default NavigationTitle;
