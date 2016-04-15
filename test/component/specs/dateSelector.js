import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import sinon from 'sinon';
import moment from 'moment';

import DateSelector from '../../../app/main/components/DateSelector';
import DateSelectorArrow from '../../../app/main/components/DateSelectorArrow';
import DateSelectorLabel from '../../../app/main/components/DateSelectorLabel';

describe('<DateSelector />', () => {
  describe('#basic', () => {
    it('should contain sub-components with correct amount', () => {
      const wrapper = shallow(<DateSelector />);
      expect(wrapper.find(DateSelectorArrow)).to.have.length(2);
      expect(wrapper.find(DateSelectorLabel)).to.have.length(2);
    });

    it('should be disabled with corresponding classname', () => {
      const wrapper = shallow(<DateSelector className="disabled" />);
      expect(wrapper.hasClass('disabled')).to.be.equal(true);
    });

    it('should have correct arrow direction', () => {
      const wrapper = shallow(<DateSelector />);

      const leftArrow = wrapper.find(DateSelectorArrow).first();
      const rightArrow = wrapper.find(DateSelectorArrow).last();

      expect(leftArrow.props().direction).to.equal('left');
      expect(rightArrow.props().direction).to.equal('right');
    });
  });

  describe('#Current Month', () => {
    it('should not be able to click next month', () => {
      const wrapper = shallow(<DateSelector />);

      const leftArrow = wrapper.find(DateSelectorArrow).first();
      const rightArrow = wrapper.find(DateSelectorArrow).last();

      // Workaround:
      // it is a limitation of enzyme, which cannot validate sub-components with hasClass function
      // Reference: https://github.com/airbnb/enzyme/issues/307
      expect(leftArrow.html()).to.not.contain('disabled');
      expect(rightArrow.html()).to.contain('disabled');
    });
  });

  describe('#Last Month', () => {
    it('should be able to click previous and next month', () => {
      const wrapper = shallow(
        <DateSelector
          date={moment().subtract(1, 'months').format('L')}
          minDate={moment().subtract(1, 'years').startOf('month').format('L')}
        />
      );

      const leftArrow = wrapper.find(DateSelectorArrow).first();
      const rightArrow = wrapper.find(DateSelectorArrow).last();

      expect(leftArrow.html()).to.not.contain('disabled');
      expect(rightArrow.html()).to.not.contain('disabled');
    });
  });

  describe('#Last Year', () => {
    it('should not be able to click previous month', () => {
      const wrapper = shallow(
        <DateSelector
          date={moment().subtract(1, 'year').format('L')}
          minDate={moment().subtract(1, 'year').startOf('month').format('L')}
        />
      );

      const leftArrow = wrapper.find(DateSelectorArrow).first();
      const rightArrow = wrapper.find(DateSelectorArrow).last();

      expect(leftArrow.html()).to.contain('disabled');
      expect(rightArrow.html()).to.not.contain('disabled');
    });
  });

  describe('#Change Date', () => {
    it('should be able to trigger onChange', () => {
      const onChange = sinon.spy();

      const wrapper = shallow(
        <DateSelectorArrow
          direction="right"
          onChange={onChange}
          date={moment().subtract(1, 'year').format('L')}
          minDate={moment().subtract(1, 'year').startOf('month').format('L')}
        />
      );

      wrapper.find('div').simulate('click');

      expect(onChange.calledOnce).to.equal(true);
    });
  });
});
