import React from 'react';

let NavigationTitle = React.createClass({
  render: function() {
    return (
      <ul className="title-area app-header__title-area">
        <li className="name app-header__title">
          <h1>{this.props.title}</h1>
        </li>
      </ul>
    );
  }
});

export default NavigationTitle;
