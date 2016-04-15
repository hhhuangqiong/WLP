import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

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
  });
});
