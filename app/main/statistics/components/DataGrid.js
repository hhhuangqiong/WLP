import React, { PropTypes, Component } from 'react';
import classNames from 'classnames';

const EMPTY_DATA_LABEL = '0';
const DATA_FETCHING_LABEL = '-';

class DataCellWrapper extends Component {
  static propTypes = {
    totalColumns: PropTypes.number,
    children: PropTypes.arrayOf(PropTypes.element),
  };

  static defaultProps = {
    totalColumns: 24,
  };

  constructor(props) {
    super(props);
  }

  render() {
    const { children, totalColumns } = this.props;

    return (
      <div className="data-cell__wrapper row">
        {
          React.Children.map(children, (child) => {
            return (
              <div className={classNames(`large-${ totalColumns / children.length }`, `columns`)}>
                { child }
              </div>
            );
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
    isLoading: PropTypes.bool,
    changeEffect: PropTypes.oneOf([
      'positive', 'negative',
    ]),
    changePercentage: PropTypes.string,
    formatter: PropTypes.func,
  };

  static defaultProps = {
    formatter: (data) => {
      if (!data || isNaN(data) || data === 'Infinity') {
        return EMPTY_DATA_LABEL;
      }

      return data;
    },
    isLoading: false,
  };

  constructor(props) {
    super(props);
  }

  render() {
    const { isLoading, title, data, unit, changeDir, changeEffect, changeAmount, changePercentage, formatter } = this.props;

    return (
      <div className="data-cell">
        <div className="data-cell__title">{ title }</div>
        <div className="data-cell__data">
          { this._localiseData(formatter(data)) }
        </div>
        <If condition={!this.isEmpty() && !isLoading && !!unit && unit !== '%'}>
          <div className="data-cell__unit">{ unit }</div>
        </If>
        <If condition={!this.isEmpty() && !isLoading && (!!changeAmount || !!changePercentage)}>
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
    );
  }

  isEmpty() {
    const { data } = this.props;
    return !data || isNaN(data) || data === 'Infinity';
  }

  _localiseData(data) {
    if (this.props.isLoading) return DATA_FETCHING_LABEL;

    if (!data || isNaN(data) || data === 'Infinity') {
      return EMPTY_DATA_LABEL;
    }

    return (data && data.toLocaleString());
  }
}

export {
  DataCellWrapper as Wrapper,
  DataCell as Cell,
};
