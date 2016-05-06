import React, { PropTypes } from 'react';
import Sidebar from '../../../modules/sidebar/container';
import CanvasWrapper from './CanvasWrapper';
import Navigation from './NavigationBar';
import Title from './NavigationTitle';
import Menu from './NavigationMenu';
import Content from './MainContent';
import SystemMessage from './SystemMessage';
import LoadingSpinner from './LoadingSpinner';
import classnames from 'classnames';

const Protected = React.createClass({
  propTypes: {
    pageTitle: PropTypes.string.isRequired,
  },

  getInitialState() {
    return {
      isOffCanvas: true,
    };
  },

  _setOffCanvas(isOffCanvas) {
    this.setState({
      isOffCanvas,
    });
  },

  render() {
    return (
      <div className={classnames({ 'wrapper--extended': !this.state.isOffCanvas })}>
        <Sidebar isOffCanvas={this.state.isOffCanvas} handleOffCanvas={this._setOffCanvas} />
        <CanvasWrapper isOffCanvas={this.state.isOffCanvas}>
          <Navigation isOffCanvas={this.state.isOffCanvas}>
            <Title title={this.props.pageTitle} />
            <Menu />
          </Navigation>
          <Content isOffCanvas={this.state.isOffCanvas}>
            { this.props.children }
          </Content>
        </CanvasWrapper>
        <SystemMessage />
        <LoadingSpinner />
      </div>
    );
  },
});

module.exports = Protected;
