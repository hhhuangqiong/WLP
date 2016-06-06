import React, { PropTypes } from 'react';

export default function Icon({ symbol, svgFile }) {
  return (
    <svg className={`icon ${symbol}`}>
      <use xlinkHref={`${svgFile}#${symbol}`}></use>
    </svg>
  );
}

Icon.propTypes = {
  symbol: PropTypes.string.isRequired,
  svgFile: PropTypes.string.isRequired,
};

Icon.defaultProps = {
  svgFile: '/images/icons.svg',
};
