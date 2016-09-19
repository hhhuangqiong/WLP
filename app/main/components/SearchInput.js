import React, { PropTypes } from 'react';
import classNames from 'classnames';
export const SUBMIT_KEY = 13;

const SearchInput = (props) => (
  <input
    className={classNames(
      'top-bar-section__query-input',
      'right',
    )}
    type="text"
    name={props.searchInputName}
    value={props.value}
    placeholder={props.placeHolder}
    onChange={props.onInputChangeHandler}
    onKeyPress={props.onKeyPressHandler}
  />
);

SearchInput.propTypes = {
  value: PropTypes.string,
  placeHolder: PropTypes.string,
  searchInputName: PropTypes.string,
  onInputChangeHandler: PropTypes.func,
  onKeyPressHandler: PropTypes.func,
};

SearchInput.defaultProps = {
  value: '',
  placeHolder: '',
  onInputChangeHandler: null,
  onKeyPressHandler: null,
};

export default SearchInput;
