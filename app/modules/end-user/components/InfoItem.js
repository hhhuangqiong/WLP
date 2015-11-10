import React, { PropTypes } from 'react';
import classNames from 'classnames';

var InfoItem = React.createClass({
  PropTypes: {
    label: PropTypes.string,
    capitalze: PropTypes.boolean
  },

  render: function() {
    return (
      <div className="row">
        <div className="large-24 columns">
          <div className="accordion__item__label left">{this.props.label}</div>
          <div className={classNames(
            'accordion__item__content',
            {capitalize: this.props.capitalize},
            'right'
          )}>
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
});

export default InfoItem;
