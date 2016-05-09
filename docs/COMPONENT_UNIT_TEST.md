# Component Unit Tests

 The main difference between component level unit tests and the normal unit test is that
 the component unit tests focus mainly on the UI view level.
 We use Airbnb Enzyme as component testing framework for a more easy and meaningful way.

 ## Objectives

 - Test user events
 - Test the response to those events
 - Make sure the right things render at the right time

## Comparison

### The lower level approach

```javascript
import TestUtils from 'react-addons-test-utils';

const renderer = TestUtils.createRenderer();

function shallow(Component, props) {
    renderer.render(<Component {...props} />);
    return renderer.getRenderOutput();
}
```

- require a higher learning curve
- complex naming convetion, e.g. `findRenderedDOMComponentWithClass`

### The Jest approach

```javascript
jest.unmock('../CheckboxWithLabel');

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import CheckboxWithLabel from '../CheckboxWithLabel';

describe('CheckboxWithLabel', () => {
  it('changes the text after click', () => {
    // Render a checkbox with label in the document
    const checkbox = TestUtils.renderIntoDocument(
      <CheckboxWithLabel labelOn="On" labelOff="Off" />
    );

    const checkboxNode = ReactDOM.findDOMNode(checkbox);

    // Verify that it's Off by default
    expect(checkboxNode.textContent).toEqual('Off');

    // ...
  });
});
```

- still need to interact with react-addons-test-utils
- reside on the component directory as `__tests__`
- install extra packages such as babel-jest
- require extra settings in packages.json

### Enzyme

```javascript
import { shallow } from 'enzyme';

it('renders three <Foo /> components', () => {
  const wrapper = shallow(<MyComponent />);
  expect(wrapper.find(Foo)).to.have.length(3);
});
```

- freendom on choosing the ways to test a component (shallow, DOM rendering, CheerIO)
- more natrual syntax
- better integration with mocha
- even recommanded by Facebook

## Before start

```sh
npm i --save-dev enzyme react-addons-test-utils react-dom
```

## Shallow Rendering vs Full DOM Rendering vs Static Rendered Markup

### Shallow Rendering

```javascript
import { shallow } from 'enzyme';
```

- simplier, but it cannot be directly asserted on behavior of any child components

#### Example

```javascript
it('simulates click events', () => {
  const onButtonClick = sinon.spy();
  const wrapper = shallow(
    <Foo onButtonClick={onButtonClick} />
  );
  wrapper.find('button').simulate('click');
  expect(onButtonClick.calledOnce).to.equal(true);
});
```

### Full DOM Rendering

```javascript
import { mount } from 'enzyme';
```

- components that may interact with DOM apis (with jsdom)
- require the full lifecycle in order to fully test the component (ie, componentDidMount etc.)
- run on a more browser like environment

### Static Rendered Markup

```javascript
import { render } from 'enzyme';
```

- render react components to static HTML and analyze the resulting HTML structure
- uses a third party HTML parsing and traversal library Cheerio (good at handling parsing and traversing HTML )
- http://cheeriojs.github.io/cheerio/
