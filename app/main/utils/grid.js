import { find, isNumber, isPlainObject, reduce } from 'lodash';
import classNames from 'classnames';

/**
 * @method getGridColumnClass
 * to return a class string for grid system, adopting Foundation CSS by default
 *
 * @param totalColumns {Number} total number of column in grid system
 * @param columnPerRow {Number|Object} number of columns per row
 * @param options {Object}
 * @param options.prefix {String} the class for columns prefix,
 * 'small'/'medium'/'large' for Foundation CSS
 * @param options.columnClass {String} the column class, 'columns' for Foundation CSS
 * @returns {*}
 */
// eslint-disable-next-line max-len
export function getGridColumnClass(totalColumns, columnPerRow, options = { prefix: 'large-', columnClass: 'columns' }) {
  const { prefix, columnClass } = options;

  if (!isNumber(totalColumns)) {
    throw new Error('`totalColumns` is not a number');
  }

  if (!isNumber(columnPerRow) && !isPlainObject(columnPerRow)) {
    throw new Error('`columnPerRow` is neither a number nor an object of number');
  }

  if (isNumber(columnPerRow)) {
    const columnSize = Math.floor(totalColumns / columnPerRow);
    return classNames(`${prefix}${columnSize}`, columnClass);
  }

  if (find(columnPerRow, val => !isNumber(val))) {
    throw new Error('`columnPerRow` is neither a number nor an object of number');
  }

  const classes = reduce(columnPerRow, (result, columnSize, className) => {
    const gridSize = Math.floor(totalColumns / columnSize);
    result.push(`${className}-${gridSize}`);
    return result;
  }, []);

  return classNames(classes, columnClass);
}
