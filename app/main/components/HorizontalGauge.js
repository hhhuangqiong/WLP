import React from 'react';
import classNames from 'classnames';

/**
 * @class HorizontalGauge
 * @property {Number} percentage  The number determined the percentage length of the gauge (0-100)
 * @property {String} color  The color of the gauge
 */
export default React.createClass({
  render() {
    const width = this.props.percentage + '%';

    const style = {
      backgroundColor: this.props.color,
      width: width,
    };

    return (
      <div className={classNames(this.props.className, 'horizontal-gauge')}>
        <div className="horizontal-gauge__bar" style={style}></div>
      </div>
    );
  },
});
