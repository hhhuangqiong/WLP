import { isNumber, isUndefined, reduce } from 'lodash';
import React, { PropTypes, Children, Component } from 'react';
import { getGridColumnClass } from '../../utils/grid';
import classNames from 'classnames';
import warning from 'warning';

const EMPTY_DATA_LABEL = '0';
const DATA_FETCHING_LABEL = '-';

const Wrapper = props => {
  const {
    children,
    totalColumns,
    maxColumnPerRow,
    customClass,
    wrapperClass,
  } = props;

  let { columnPerRow } = props;

  warning(
    totalColumns % columnPerRow !== 0,
    // eslint-disable-next-line max-len
    `Invalid number of columns per row. It should be evenly divisible by total columns of ${totalColumns}, or the layout will be distorted.`
  );

  if (!columnPerRow) {
    if (isNumber(maxColumnPerRow)) {
      columnPerRow = maxColumnPerRow;
    } else {
      columnPerRow = reduce(maxColumnPerRow, (result, columnSize, className) => {
        // eslint-disable-next-line no-param-reassign
        result[className] = Math.min(Children.count(children), columnSize);
        return result;
      }, {});
    }
  }

  const gridClassName = getGridColumnClass(totalColumns, columnPerRow);

  return (
    <div className={classNames(customClass, wrapperClass)}>
      {
        Children.map(children, child => (
          <div className={gridClassName}>
            { child }
          </div>
        ))
      }
    </div>
  );
};

Wrapper.propTypes = {
  columnPerRow: PropTypes.oneOfType([
    // for non-responsiveness
    PropTypes.number,
    // for responsiveness
    PropTypes.object,
    // for Foundation CSS
    PropTypes.shape({
      large: PropTypes.number,
      medium: PropTypes.number,
      small: PropTypes.number,
    }),
  ]),
  maxColumnPerRow: PropTypes.oneOfType([
    // for non-responsiveness
    PropTypes.number,
    // for responsiveness
    PropTypes.object,
    // for Foundation CSS
    PropTypes.shape({
      large: PropTypes.number,
      medium: PropTypes.number,
      small: PropTypes.number,
    }),
  ]),
  totalColumns: PropTypes.number,
  children: PropTypes.arrayOf(PropTypes.element),
  customClass: PropTypes.oneOf([
    PropTypes.string,
    PropTypes.array,
  ]),
  wrapperClass: PropTypes.oneOf([
    PropTypes.string,
    PropTypes.array,
  ]),
};

Wrapper.defaultProps = {
  maxColumnPerRow: {
    large: 6,
    medium: 4,
    small: 2,
  },
  totalColumns: 24,
  customClass: 'data-cell__wrapper',
  wrapperClass: 'row',
};

class DataCell extends Component {
  _isEmpty() {
    const { data } = this.props;
    return isUndefined(data) || isNaN(data) || data === 'Infinity';
  }

  _isLoading() {
    const { isLoading } = this.props;
    return isLoading;
  }

  _withoutChange() {
    const {
      changeDir,
      changeEffect,
      changeAmount,
      changePercentage,
    } = this.props;

    return !changeDir || !changeEffect || !changeAmount || !changePercentage;
  }

  _localiseData(data) {
    const { isLoading } = this.props;

    if (isLoading || data === null) {
      return DATA_FETCHING_LABEL;
    }

    if (isNaN(data) || data === 'Infinity') {
      return EMPTY_DATA_LABEL;
    }

    return (data && data.toLocaleString());
  }

  renderUnit() {
    const { unit } = this.props;

    return (!this._isEmpty() && !this._isLoading() && !!unit && unit !== '%') ? (
      <div className="data-cell__unit">{ unit }</div>
    ) : null;
  }

  renderArrow(direction) {
    return !!direction ? <span className="arrow" /> : null;
  }

  renderChangeNumber(amount) {
    return !isUndefined(amount) ? <span>{ amount }</span> : null;
  }

  renderChangePercentage(percentage) {
    return !isUndefined(percentage) ? <span>{`(${percentage}%)`}</span> : null;
  }

  renderDataChange() {
    const {
      changeDir,
      changeEffect,
      changeAmount,
      changePercentage,
    } = this.props;

    if (!this._isEmpty() && !this._isLoading() && !this._withoutChange()) {
      return (
        <div className={classNames('data-cell__trend', changeEffect, changeDir)}>
          { this.renderArrow(changeDir) }
          { this.renderChangeNumber(this._localiseData(changeAmount)) }
          { this.renderChangePercentage(this._localiseData(changePercentage)) }
        </div>
      );
    }

    return null;
  }

  render() {
    const {
      data,
      formatter,
      title,
    } = this.props;

    return (
      <div className="data-cell">
        <div className="data-cell__title">{ title }</div>
        <div className="data-cell__data">
          { this._localiseData(formatter(data)) }
        </div>
        { this.renderUnit() }
        { this.renderDataChange() }
      </div>
    );
  }
}

DataCell.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  unit: PropTypes.string,
  decimalPlace: PropTypes.number,
  changeDir: PropTypes.string,
  changeAmount: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  isLoading: PropTypes.bool,
  changeEffect: PropTypes.oneOf([
    'positive', 'negative', 'no-effect',
  ]),
  changePercentage: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  formatter: PropTypes.func,
};

DataCell.defaultProps = {
  formatter: data => {
    if (data === null) {
      return DATA_FETCHING_LABEL;
    }

    if (isNaN(data) || data === 'Infinity') {
      return EMPTY_DATA_LABEL;
    }

    return data;
  },
  isLoading: false,
};

export {
  Wrapper as Wrapper,
  DataCell as Cell,
};
