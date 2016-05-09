import React from 'react';
import { shallow, mount } from 'enzyme';
import { expect } from 'chai';
import { spy } from 'sinon';

import TimeFramePicker from '../../../app/main/components/TimeFramePicker';

describe('<TimeFramePicker />', () => {
  describe('#Normal', () => {
    it('should have same number of children for frames length', () => {
      expect(shallow(
        <TimeFramePicker
          frames={['24 hours']}
        />
      ).children()).to.have.length(1);

      expect(shallow(
        <TimeFramePicker
          frames={['24 hours', '7 days']}
        />
      ).children()).to.have.length(2);
    });
  });

  describe('#Active', () => {
    it('should show correct active item', () => {
      const wrapper = shallow(
        <TimeFramePicker
          frames={['24 hours']}
          currentFrame="24 hours"
        />
      );

      expect(wrapper.find('.active').text()).to.equal('24 hrs');
    });

    it('should show correct active item for multiple time frame', () => {
      const wrapper = shallow(
        <TimeFramePicker
          frames={['24 hours', '7 days']}
          currentFrame="7 days"
        />
      );

      expect(wrapper.find('.active').text()).to.equal('7 days');
    });

    it('should detect click event when receiving it', () => {
      const onChange = spy();

      const wrapper = mount(
        <TimeFramePicker
          frames={['24 hours', '7 days']}
          currentFrame="7 days"
          onChange={onChange}
        />
      );

      wrapper.find('span').last().simulate('click');
      expect(onChange.calledOnce).to.equal(true);
    });

    it('should change time frame when a props has changed', () => {
      const wrapper = mount(
        <TimeFramePicker
          frames={['24 hours', '7 days', '30 days']}
          currentFrame="7 days"
          onChange={spy()}
        />
      );

      expect(wrapper.find('.active').text()).to.equal('7 days');

      wrapper.setProps({
        currentFrame: '30 days',
      });

      expect(wrapper.find('.active').text()).to.equal('30 days');
    });
  });
});
