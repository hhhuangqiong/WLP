import React from 'react';
import classNames from 'classnames';

var InfoItem = React.createClass({
  render: function() {
    return (
      <div className="accordion__item__body__row large-24 columns">
        <div className="accordion__item__body__row__label left">{this.props.label}</div>
        <div className={classNames(
          'accordion__item__body__row__content',
          {capitalize: this.props.capitalize},
          'right'
        )}>
          {this.props.children}
        </div>
      </div>
    );
  }
});

export default InfoItem;
