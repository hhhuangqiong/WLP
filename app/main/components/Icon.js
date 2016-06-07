import React, { PropTypes } from 'react';
import classNames from 'classnames';

export default class Icon extends React.Component {
  // Disable dynamic change the state and render the icon again.
  shouldComponentUpdate() {
    return false;
  }

  render() {
    const { svgFile, symbol, className, ...restProps } = this.props;
    return (
      <svg className={classNames('icon', symbol, className)} {...restProps} >
        <use xlinkHref={`${svgFile}#${symbol}`}></use>
      </svg>
    );
  }
}

Icon.propTypes = {
  symbol: PropTypes.string.isRequired,
  svgFile: PropTypes.string.isRequired,
  className: PropTypes.string,
};

Icon.defaultProps = {
  svgFile: '/images/icons.svg',
};
