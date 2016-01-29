import React, { PropTypes, Component } from 'react';
import classNames from 'classnames';

class PercentageChart extends Component {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    customClass: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.array
    ]),
    title: PropTypes.string.isRequired,
    percentage: PropTypes.number.isRequired,
    stat: PropTypes.number.isRequired,
    unit: PropTypes.string
  };

  render() {
    let { customClass, title, percentage, stat, unit } = this.props;

    return (
      <div className={classNames(`percentage-chart`, customClass)}>
        <div className="large-18 columns">
          <p className="percentage-chart__title primary">{ title }</p>
          <div className="progress radius">
            <span className="meter" style={{ width: `${percentage}%` }} />
          </div>
        </div>
        <div className="large-6 columns">
          <p className="percentage-chart__percentage primary">{ percentage } %</p>
          <span className="percentage-chart secondary">{ stat } { unit }</span>
        </div>
      </div>
    );
  }
}

export default PercentageChart;
