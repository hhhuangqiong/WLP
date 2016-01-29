jest.dontMock('../CircleIcon.js');

import React from 'react/addons';
import { SMALL, SMALL_SIZE, MEDIUM, MEDIUM_SIZE, SIZE_RATIO } from '../CircleIcon';

// Jest does not allow using export default by es6 import
const CircleIcon = require('../CircleIcon').default;

const { TestUtils } = React.addons;

describe('CircleIcon', () => {
  it('change the icon color and box color', () => {
    let redAndWhiteMockData = {
      backgroundColor: 'red',
      color: 'white'
    };

    let yellowAndBlackMockData = {
      backgroundColor: 'yellow',
      color: 'black'
    };

    let redAndWhiteRenderedComponent = TestUtils.renderIntoDocument(
      <CircleIcon
        backgroundColor={redAndWhiteMockData.backgroundColor}
        iconColor={redAndWhiteMockData.color}
      />
    );

    let yellowAndBlackRenderedComponent = TestUtils.renderIntoDocument(
      <CircleIcon
        backgroundColor={yellowAndBlackMockData.backgroundColor}
        iconColor={yellowAndBlackMockData.color}
      />
    );

    let redAndWhiteIconBox = TestUtils.findRenderedDOMComponentWithTag(redAndWhiteRenderedComponent, 'div');
    expect(redAndWhiteIconBox.getDOMNode().style.backgroundColor).toEqual(redAndWhiteMockData.backgroundColor);
    expect(redAndWhiteIconBox.getDOMNode().style.color).toEqual(redAndWhiteMockData.color);

    let yellowAndBlackIconBox = TestUtils.findRenderedDOMComponentWithTag(yellowAndBlackRenderedComponent, 'div');
    expect(yellowAndBlackIconBox.getDOMNode().style.backgroundColor).toEqual(yellowAndBlackMockData.backgroundColor);
    expect(yellowAndBlackIconBox.getDOMNode().style.color).toEqual(yellowAndBlackMockData.color);
  });

  it('change the icon ratio', () => {
    let smallSizeMockData = {
      size: SMALL,
      width: SMALL_SIZE * SIZE_RATIO,
      height: SMALL_SIZE * SIZE_RATIO
    };

    let mediumSizeMockData = {
      size: MEDIUM,
      width: MEDIUM_SIZE * SIZE_RATIO,
      height: MEDIUM_SIZE * SIZE_RATIO
    };

    let smallRenderedComponent = TestUtils.renderIntoDocument(
      <CircleIcon size={smallSizeMockData.size} />
    );

    let mediumRenderedComponent = TestUtils.renderIntoDocument(
      <CircleIcon size={mediumSizeMockData.size} />
    );

    let smallIconBox = TestUtils.findRenderedDOMComponentWithTag(smallRenderedComponent, 'div');
    expect(smallIconBox.getDOMNode().style.width).toEqual(`${smallSizeMockData.width}px`);
    expect(smallIconBox.getDOMNode().style.height).toEqual(`${smallSizeMockData.height}px`);

    let mediumIconBox = TestUtils.findRenderedDOMComponentWithTag(mediumRenderedComponent, 'div');
    expect(mediumIconBox.getDOMNode().style.width).toEqual(`${mediumSizeMockData.width}px`);
    expect(mediumIconBox.getDOMNode().style.height).toEqual(`${mediumSizeMockData.height}px`);
  });

  it('change the component icon', function() {
    let adminMockData = { icon: 'icon-administrator' };
    let marketerMockData = { icon: 'icon-marketer' };

    let adminComponent = TestUtils.renderIntoDocument(
      <CircleIcon icon={adminMockData.icon} />
    );

    let marketerComponent = TestUtils.renderIntoDocument(
      <CircleIcon icon={marketerMockData.icon} />
    );

    let adminIcon = TestUtils.findRenderedDOMComponentWithTag(adminComponent, 'span');
    expect(adminIcon.getDOMNode().className).toContain(adminMockData.icon);

    let marketerIcon = TestUtils.findRenderedDOMComponentWithTag(marketerComponent, 'span');
    expect(marketerIcon.getDOMNode().className).toContain(marketerMockData.icon);
  });
});
