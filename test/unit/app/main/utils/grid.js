import { reduce } from 'lodash';
import { expect } from 'chai';
import classNames from 'classnames';
import { getGridColumnClass } from 'app/main/utils/grid';

describe('#getGridColumnClass()', () => {
  const validTotalColumn = 24;
  const invalidTotalColumn = { large: 24, medium: 24, small: 24 };
  const numberColumnPerRow = 1;
  const unevenColumnPerRow = 5;
  const invalidObjectColumnPerRow = { large: '1', medium: '1', small: '1' };
  const objectColumnPerRow = { large: 1, medium: 1, small: 1 };
  const invalidColumnPerRow = [1, 1, 1];
  const validOption = { prefix: 'col-lg', columnClass: '' };
  const expectedClassName = reduce(objectColumnPerRow, (result, columnSize, className) => {
    result.push(`${className}-${validTotalColumn / columnSize}`);
    return result;
  }, []);

  it('should throw error if the `totalColumn` argument is not a number', done => {
    const fn = () => getGridColumnClass(invalidTotalColumn, numberColumnPerRow);
    expect(fn).to.throw('`totalColumns` is not a number');
    done();
  });

  it('should throw error if `columnPerRow` argument is neither a number of an object', done => {
    const fn = () => getGridColumnClass(validTotalColumn, invalidColumnPerRow);
    expect(fn).to.throw('`columnPerRow` is neither a number nor an object of number');
    done();
  });

  it('should throw error if `columnPerRow` argument is not an object of number', done => {
    const fn = () => getGridColumnClass(validTotalColumn, invalidObjectColumnPerRow);
    expect(fn).to.throw('`columnPerRow` is neither a number nor an object of number');
    done();
  });

  // eslint-disable-next-line max-len
  it(`should return string of 'large-${validTotalColumn / numberColumnPerRow} columns' without option argument`, done => {
    const className = getGridColumnClass(validTotalColumn, numberColumnPerRow);
    expect(className).to.be.a('string');
    // eslint-disable-next-line max-len
    expect(className).to.equal(classNames(`large-${validTotalColumn / numberColumnPerRow}`, 'columns'));
    done();
  });

  // eslint-disable-next-line max-len
  it(`should return string of 'large-${Math.floor(validTotalColumn / unevenColumnPerRow)} columns' with uneven columnPerRow`, done => {
    const className = getGridColumnClass(validTotalColumn, unevenColumnPerRow);
    expect(className).to.be.a('string');
    // eslint-disable-next-line max-len
    expect(className).to.equal(classNames(`large-${Math.floor(validTotalColumn / unevenColumnPerRow)}`, 'columns'));
    done();
  });

  it('should override the class prefix and column class with option argument', done => {
    const className = getGridColumnClass(validTotalColumn, numberColumnPerRow, validOption);
    // eslint-disable-next-line max-len
    expect(className).to.equal(classNames(`${validOption.prefix}${validTotalColumn / numberColumnPerRow}`, validOption.columnClass));
    done();
  });

  // eslint-disable-next-line max-len
  it('should accept `columnPerRow` argument in object type, and use its keys as prefix class', done => {
    const className = getGridColumnClass(validTotalColumn, objectColumnPerRow, validOption);
    expect(className).to.equal(classNames(expectedClassName, validOption.columnClass));
    done();
  });
});
