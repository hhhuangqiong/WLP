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

var Searchbox = React.createClass({
  propTypes: {
    onKeyPressHandler: React.PropTypes.func.isRequired
  },

  getInitialState: function() {
    return {
      hasSearchType: false,
      searchTypes: [
          {name: '', value: ''}
      ],
      placeHolder: '',
      onInputChangeHandler: null,
      onKeyPressHandler: null,
      onSelectChangeHandler: null
    }
  },

  getDefaultProps: function() {
    return {
      hasSearchType: false,
      searchTypes: [
        {name: '', value: ''}
      ],
      placeHolder: '',
      onInputChangeHandler: null,
      onKeyPressHandler: null,
      onSelectChangeHandler: null
    }
  },

  componentWillReceiveProps: function(props) {
    this.props = props;
    this.props.hasSearchType = props.searchTypes.length > 0;
  },

  handleSearchSubmit: function(e) {
    e.preventDefault();
  },

  render: function() {
    let options = this.props.searchTypes.map((type) => {
      return <option value={type.value}>{type.name}</option>
    });

    let dropDown = (this.props.hasSearchType) ?
        <select className="top-bar-section__query-select left" name="searchDropDown" onChange={this.props.onSelectChangeHandler}>{options}</select> :
        {};

    return(
      <form onSubmit={this.handleSearchSubmit}>
        <input
          className={classNames('top-bar-section__query-input','right',{'with-select':this.props.hasSearchType})}
          type="text"
          name="searchInput"
          placeholder={this.props.placeHolder}
          onChange={this.props.onInputChangeHandler}
          onKeyPress={this.props.onKeyPressHandler}
        />
        {dropDown}
      </form>
    );
  }
});

export default Searchbox;
