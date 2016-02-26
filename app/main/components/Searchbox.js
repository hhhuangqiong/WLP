import React, { PropTypes } from 'react';
import classNames from 'classnames';

const SearchBox = React.createClass({
  propTypes: {
    value: PropTypes.string,
    placeHolder: PropTypes.string,
    searchInputName: PropTypes.string,
    searchTypeInputName: PropTypes.string,
    searchTypes: PropTypes.array,
    selectedType: PropTypes.string,
    onInputChangeHandler: PropTypes.func,
    onKeyPressHandler: PropTypes.func.isRequired,
    onSelectChangeHandler: PropTypes.func,
  },

  getDefaultProps() {
    return {
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
  },

  render() {
    return (
      <div>
        <If condition={this.props.searchTypes}>
          <select
            className={classNames('top-bar-section__query-select', 'left')}
            name={this.props.searchTypeInputName}
            onChange={this.props.onSelectChangeHandler}
            value={this.props.selectedType}
          >
            {
              this
                .props
                .searchTypes
                .map((type, index) => (
                  // this will trigger a warning of
                  // `Use the `defaultValue` or `value` props on <select> instead of
                  // setting `selected` on <option>.`
                  // from React, but without doing this,
                  // the selected value will be jumpy,
                  // e.g. the value changes again on client side rendering
                  type.value === this.props.selectedType ?
                    <option key={index} value={type.value} selected>{type.name}</option> :
                    <option key={index} value={type.value}>{type.name}</option>
                ))
            }
          </select>
        </If>
        <input
          className={classNames(
            'top-bar-section__query-input',
            { 'with-select': this.props.searchTypes },
            { right: this.props.searchTypes }
          )}
          type="text"
          name={this.props.searchInputName}
          value={this.props.value}
          placeholder={this.props.placeHolder}
          onChange={this.props.onInputChangeHandler}
          onKeyPress={this.props.onKeyPressHandler}
        />
      </div>
    );
  },
});

export default SearchBox;
