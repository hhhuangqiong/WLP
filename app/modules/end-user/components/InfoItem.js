import React, { PropTypes } from 'react';
import classNames from 'classnames';

const InfoItem = React.createClass({
  propTypes: {
    label: PropTypes.string,
    capitalze: PropTypes.bool,
    capitalize: PropTypes.bool,
    children: PropTypes.element.isRequired,
  },

  render() {
    return (
      <div className="row">
        <div className="large-24 columns">
          <div className="accordion__item__label left">{this.props.label}</div>
          <div className={
            classNames(
              'accordion__item__content',
              { capitalize: this.props.capitalize },
              'right'
            )}
          >
            {this.props.children}
          </div>
        </div>
      </div>
    );
  },
});

export default InfoItem;
