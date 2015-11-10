import React, { PropTypes, Component } from 'react';

export default class SearchButton extends Component {
  static propTypes = {
    value: PropTypes.string,
    placeHolder: PropTypes.string,
    searchTypes: PropTypes.object,
    searchInputName: PropTypes.string,
    searchTypeInputName: PropTypes.string,
    onInputChangeHandler: PropTypes.func,
    onSelectChangeHandler: PropTypes.func,
    onKeyPressHandler: PropTypes.func.isRequired
  };

  render() {
    return (
      <div className="search-button">
      	<input
          type="search"
          name={this.props.searchInputName}
          value={this.props.value}
          placeholder={this.props.placeHolder || 'Search'}
          onChange={this.props.onInputChangeHandler}
          onKeyPress={this.props.onKeyPressHandler}
        />
      </div>
    );
  }
}
