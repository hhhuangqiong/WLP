import React, { PropTypes, Component } from 'react';
import classNames from 'classnames';

const EMPTY_DATA = 'N/A';

class DataCellWrapper extends Component {
  static propTypes = {
    totalColumns: PropTypes.number
  };

  static defaultProps = {
    totalColumns: 24
  };

  constructor(props) {
    super(props);
  }

  render() {
    let { children, totalColumns } = this.props;

    return (
      <div className="data-cell__wrapper row">
        {
          React.Children.map(children, (child) => {
            return (
              <div className={classNames(`large-${ totalColumns / children.length }`, `columns`)}>
                { child }
              </div>
            )
          })
        }
      </div>
    );
  }
}

class DataCell extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    data: PropTypes.string.isRequired,
    unit: PropTypes.string,
    decimalPlace: PropTypes.number,
    changeDir: PropTypes.string,
    changeAmount: PropTypes.string,
    changeEffect: PropTypes.oneOf([
      'positive', 'negative'
    ]),
    changePercentage: PropTypes.string,
    formatter: PropTypes.func,
  };

  static defaultProps = {
    formatter: (data) => {
      if (!data || isNaN(data) || data === 'Infinity') {
        return EMPTY_DATA;
      }

      return data;
    },
  };

  constructor(props) {
    super(props);
  }

  _localiseData(data) {
    if (!data || isNaN(data) || data === 'Infinity') {
      return EMPTY_DATA;
    }

    return (data && data.toLocaleString());
  }

  render() {
    let { title, data, unit, changeDir, changeEffect, changeAmount, changePercentage, formatter } = this.props;

    return (
      <div className="data-cell">
        <div className="data-cell__title">{ title }</div>
        <div className="data-cell__data">
          { this._localiseData(formatter(data)) }
        </div>
        <If condition={!!unit && unit !== '%'}>
          <div className="data-cell__unit">{ unit }</div>
        </If>
        <If condition={!!changeAmount || !!changePercentage}>
          <div className={classNames(`data-cell__trend`, changeEffect, changeDir)}>
            <If condition={!!changeDir}>
              <span className="arrow" />
            </If>
            <If condition={!!changeAmount}>
              <span>{ changeAmount }</span>
            </If>
            <If condition={!!changePercentage}>
              <span>{`(${changePercentage}%)`}</span>
            </If>
          </div>
        </If>
      </div>
    )
  }
}

export {
  DataCellWrapper as Wrapper,
  DataCell as Cell
};
