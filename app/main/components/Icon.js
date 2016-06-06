import React, { PropTypes } from 'react';
import classNames from 'classnames';

export default function Icon({ symbol, svgFile, className, ...props }) {
  return (
    <svg className={classNames('icon', className, symbol)} {...props} >
      <use xlinkHref={`${svgFile}#${symbol}`}></use>
    </svg>
  );
}

Icon.propTypes = {
  symbol: PropTypes.string.isRequired,
  svgFile: PropTypes.string.isRequired,
  className: PropTypes.string,
};

Icon.defaultProps = {
  svgFile: '/images/icons.svg',
};
