import React, { PropTypes } from 'react';
import classNames from 'classnames';

var SearchBox = React.createClass({
  propTypes: {
    value: PropTypes.string,
    placeHolder: PropTypes.string,
    searchInputName: PropTypes.string,
    searchTypeInputName: PropTypes.string,
    onInputChangeHandler: PropTypes.func,
    onKeyPressHandler: PropTypes.func.isRequired
  },

  getDefaultProps: function() {
    return {
      value: null,
      placeHolder: '',
      searchTypes: null,
      searchInputName: 'searchValue',
      searchTypeInputName: 'searchType',
      onInputChangeHandler: null,
      onKeyPressHandler: null,
      onSelectChangeHandler: null
    };
  },

  render: function() {
    return (
      <div>
        <If condition={this.props.searchTypes}>
          <select className={classNames('top-bar-section__query-select', 'left')} name={this.props.searchTypeInputName} onChange={this.props.onSelectChangeHandler}>
            {this.props.searchTypes.map((type)=>{
              return <option value={type.value}>{type.name}</option>;
            })}
          </select>
        </If>
        <input
          className={classNames('top-bar-section__query-input', { 'with-select': this.props.searchTypes }, { 'right': this.props.searchTypes })}
          type="text"
          name={this.props.searchInputName}
          value={this.props.value}
          placeholder={this.props.placeHolder}
          onChange={this.props.onInputChangeHandler}
          onKeyPress={this.props.onKeyPressHandler}
          />
      </div>
    );
  }
});

export default SearchBox;
