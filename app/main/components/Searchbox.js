import React, { PropTypes } from 'react';
import { injectIntl, intlShape } from 'react-intl';
import classNames from 'classnames';

export const SUBMIT_KEY = 13;

const SearchBox = props => {
  const { intl: { formatMessage } } = props;

  return (
    <div>
      {
        props.searchTypes ? (
          <select
            className={classNames('top-bar-section__query-select', 'left')}
            name={props.searchTypeInputName}
            onChange={props.onSelectChangeHandler}
            value={props.selectedType}
          >
            {
              props
                .searchTypes
                .map((type, index) => (
                  // this will trigger a warning of
                  // `Use the `defaultValue` or `value` props on <select> instead of
                  // setting `selected` on <option>.`
                  // from React, but without doing this,
                  // the selected value will be jumpy,
                  // e.g. the value changes again on client side rendering
                  type.value === props.selectedType ?
                    (
                      <option key={index} value={type.value} selected>
                        <span className="capitalize">{formatMessage(type.name)}</span>
                      </option>
                    ) :
                    (
                      <option key={index} value={type.value}>
                        <span className="capitalize">{formatMessage(type.name)}</span>
                      </option>
                    )
                ))
            }
          </select>
        ) : null
      }
      <input
        className={classNames(
          'top-bar-section__query-input',
          { 'with-select': props.searchTypes },
          { right: props.searchTypes }
        )}
        type="text"
        name={props.searchInputName}
        defaultValue={props.value}
        placeholder={props.placeHolder}
        onChange={props.onInputChangeHandler}
        onKeyPress={props.onKeyPressHandler}
      />
    </div>
  );
};

SearchBox.propTypes = {
  value: PropTypes.string,
  placeHolder: PropTypes.string,
  searchInputName: PropTypes.string,
  searchTypeInputName: PropTypes.string,
  searchTypes: PropTypes.array,
  selectedType: PropTypes.string,
  onInputChangeHandler: PropTypes.func,
  onKeyPressHandler: PropTypes.func.isRequired,
  onSelectChangeHandler: PropTypes.func,
  intl: intlShape.isRequired,
};

SearchBox.defaultProps = {
  value: null,
  placeHolder: '',
  searchTypes: null,
  selectedType: null,
  searchInputName: 'searchValue',
  searchTypeInputName: 'searchType',
  onInputChangeHandler: null,
  onKeyPressHandler: null,
  onSelectChangeHandler: null,
};

export default injectIntl(SearchBox);
