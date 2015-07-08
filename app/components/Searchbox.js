/**
 *  Searchbox component created for use on any part of the app
 *  Usage:
 *    <Searchbox
 *      searchTypes=[{name:'',value:''},{name:'',value:''}] // an array of objects pass if hasSearchType is true
 *      placeHolder="Some text" // text to show in text input
 *      onInputChangeHandler=function(){callback function on input box changed event}
 *      onSelectChangeHandler=function(){callback function on dropdown changed event}
 *      onKeyPressHandler=function(){callback function on keypressed event}
 *    />
 */
import React from 'react';
import classNames from 'classnames';

var SearchBox = React.createClass({
  propTypes: {
    onKeyPressHandler: React.PropTypes.func.isRequired
  },

  getDefaultProps: function() {
    return {
      search: null,
      searchTypes: null,
      placeHolder: '',
      onInputChangeHandler: null,
      onKeyPressHandler: null,
      onSelectChangeHandler: null
    }
  },

  handleSearchSubmit: function(e) {
    e.preventDefault();
  },

  makeSearchTypeOptKey: function(type) {
    return `searchTyps-${type.name}-${type.value}`; // no type checking
  },

  render: function() {
    return(
      <form onSubmit={this.handleSearchSubmit}>
        <input
          className={classNames('top-bar-section__query-input', 'right', {'with-select':this.props.searchTypes})}
          type="text"
          name="searchInput"
          value={this.props.search}
          placeholder={this.props.placeHolder}
          onChange={this.props.onInputChangeHandler}
          onKeyPress={this.props.onKeyPressHandler}
        />
        <If condition={this.props.searchTypes}>
          <select className={classNames('top-bar-section__query-select', 'left')} name="searchDropDown" onChange={this.props.onSelectChangeHandler}>
            {this.props.searchTypes.map((type)=>{
              return <option key={this.makeSearchTypeOptKey(type)} value={type.value}>{type.name}</option>;
            })}
          </select>
        </If>
      </form>
    );
  }
});

export default SearchBox;
