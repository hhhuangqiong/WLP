import _ from 'lodash';
import React, { PropTypes } from 'react';
import Joi from 'joi';

import * as Accordion from '../../../main/components/Accordion';
import * as Panel from '../../../main/components/Panel';
import * as InputGroup from '../../../main/components/InputGroup';

const Contacts = React.createClass({
  propTypes: {
    onDataChange: PropTypes.func.isRequired,
    onInputBlur: PropTypes.func.isRequired,
    getValidationMessages: PropTypes.func.isRequired,
    renderHelpText: PropTypes.func.isRequired,
    businessContact: PropTypes.shape({
      name: PropTypes.string.isRequired,
      phone: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
    }),
    technicalContact: PropTypes.shape({
      name: PropTypes.string.isRequired,
      phone: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
    }),
    supportContact: PropTypes.shape({
      name: PropTypes.string.isRequired,
      phone: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
    }),
  },

  // intend to expose this function to parent
  getValidatorTypes() {
    return {
      bcName: Joi.string().allow('').max(30).label('business contact name'),
      bcPhone: Joi.string().allow('').min(3).max(20).label('business contact phone'),
      bcEmail: Joi.string().allow('').email().label('business contact email'),
      tcName: Joi.string().allow('').max(30).label('technical contact name'),
      tcPhone: Joi.string().allow('').min(3).max(20).label('technical contact phone'),
      tcEmail: Joi.string().allow('').email().label('technical contact email'),
      scName: Joi.string().allow('').max(30).label('support contact name'),
      scPhone: Joi.string().allow('').min(3).max(20).label('support contact phone'),
      scEmail: Joi.string().allow('').email().label('support contact email'),
    };
  },

  // intend to expose this function to parent
  getValidatorData() {
    return {
      bcName: this.props.businessContact.name,
      bcPhone: this.props.businessContact.phone,
      bcEmail: this.props.businessContact.email,
      tcName: this.props.technicalContact.name,
      tcPhone: this.props.technicalContact.phone,
      tcEmail: this.props.technicalContact.email,
      scName: this.props.supportContact.name,
      scPhone: this.props.supportContact.phone,
      scEmail: this.props.supportContact.email,
    };
  },

  render() {
    return (
      <Panel.Wrapper addOn>
        <Panel.Header title="contacts" />
        <Panel.Body>
          <Accordion.Wrapper>
            <Accordion.Navigation title="business contact">
              <InputGroup.Row>
                <InputGroup.Label htmlFor="bcName">name</InputGroup.Label>
                <InputGroup.Input>
                  <input
                      className="radius"
                      type="text"
                      name="bcName"
                      value={this.props.businessContact.name}
                      onChange={_.bindKey(this.props, 'onDataChange', 'businessContact', 'name')}
                      onBlur={this.props.onInputBlur}
                    />
                  {this.props.getValidationMessages('bcName').map(this.props.renderHelpText)}
                </InputGroup.Input>
              </InputGroup.Row>
              <InputGroup.Row>
                <InputGroup.Label htmlFor="bcPhone">phone</InputGroup.Label>
                <InputGroup.Input>
                  <input
                      className="radius"
                      type="text" name="bcPhone"
                      value={this.props.businessContact.phone}
                      onChange={_.bindKey(this.props, 'onDataChange', 'businessContact', 'phone')}
                      onBlur={this.props.onInputBlur}
                    />
                  {this.props.getValidationMessages('bcPhone').map(this.props.renderHelpText)}
                </InputGroup.Input>
              </InputGroup.Row>
              <InputGroup.Row>
                <InputGroup.Label htmlFor="bcEmail">email</InputGroup.Label>
                <InputGroup.Input>
                  <input
                      className="radius"
                      type="text"
                      name="bcEmail"
                      value={this.props.businessContact.email}
                      onChange={_.bindKey(this.props, 'onDataChange', 'businessContact', 'email')}
                      onBlur={this.props.onInputBlur}
                    />
                  {this.props.getValidationMessages('bcEmail').map(this.props.renderHelpText)}
                </InputGroup.Input>
              </InputGroup.Row>
            </Accordion.Navigation>
            <Accordion.Navigation title="technical contact">
              <InputGroup.Row>
                <InputGroup.Label htmlFor="tcName">name</InputGroup.Label>
                <InputGroup.Input>
                  <input
                      className="radius"
                      type="text"
                      name="tcName"
                      value={this.props.technicalContact.name}
                      onChange={_.bindKey(this.props, 'onDataChange', 'technicalContact', 'name')}
                      onBlur={this.props.onInputBlur}
                    />
                  {this.props.getValidationMessages('tcName').map(this.props.renderHelpText)}
                </InputGroup.Input>
              </InputGroup.Row>
              <InputGroup.Row>
                <InputGroup.Label htmlFor="tcPhone">phone</InputGroup.Label>
                <InputGroup.Input>
                  <input
                      className="radius"
                      type="text"
                      name="tcPhone"
                      value={this.props.technicalContact.phone}
                      onChange={_.bindKey(this.props, 'onDataChange', 'technicalContact', 'phone')}
                      onBlur={this.props.onInputBlur}
                    />
                  {this.props.getValidationMessages('tcPhone').map(this.props.renderHelpText)}
                </InputGroup.Input>
              </InputGroup.Row>
              <InputGroup.Row>
                <InputGroup.Label htmlFor="tcEmail">email</InputGroup.Label>
                <InputGroup.Input>
                  <input
                      className="radius"
                      type="text"
                      name="tcEmail"
                      value={this.props.technicalContact.email}
                      onChange={_.bindKey(this.props, 'onDataChange', 'technicalContact', 'email')}
                      onBlur={this.props.onInputBlur}
                    />
                  {this.props.getValidationMessages('tcEmail').map(this.props.renderHelpText)}
                </InputGroup.Input>
              </InputGroup.Row>
            </Accordion.Navigation>
            <Accordion.Navigation title="support contact">
              <InputGroup.Row>
                <InputGroup.Label htmlFor="scName">name</InputGroup.Label>
                <InputGroup.Input>
                  <input
                      className="radius"
                      type="text"
                      name="scName"
                      value={this.props.supportContact.name}
                      onChange={_.bindKey(this.props, 'onDataChange', 'supportContact', 'name')}
                      onBlur={this.props.onInputBlur}
                    />
                  {this.props.getValidationMessages('scName').map(this.props.renderHelpText)}
                </InputGroup.Input>
              </InputGroup.Row>
              <InputGroup.Row>
                <InputGroup.Label htmlFor="scPhone">phone</InputGroup.Label>
                <InputGroup.Input>
                  <input
                      className="radius"
                      type="text"
                      name="scPhone"
                      value={this.props.supportContact.phone}
                      onChange={_.bindKey(this.props, 'onDataChange', 'supportContact', 'phone')}
                      onBlur={this.props.onInputBlur}
                    />
                  {this.props.getValidationMessages('scPhone').map(this.props.renderHelpText)}
                </InputGroup.Input>
              </InputGroup.Row>
              <InputGroup.Row>
                <InputGroup.Label htmlFor="scEmail">email</InputGroup.Label>
                <InputGroup.Input>
                  <input
                      className="radius"
                      type="text"
                      name="scEmail"
                      value={this.props.supportContact.email}
                      onChange={_.bindKey(this.props, 'onDataChange', 'supportContact', 'email')}
                      onBlur={this.props.onInputBlur}
                    />
                  {this.props.getValidationMessages('scEmail').map(this.props.renderHelpText)}
                </InputGroup.Input>
              </InputGroup.Row>
            </Accordion.Navigation>
          </Accordion.Wrapper>
        </Panel.Body>
      </Panel.Wrapper>
    );
  },
});

export default Contacts;
