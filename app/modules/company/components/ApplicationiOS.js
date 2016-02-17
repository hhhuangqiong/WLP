import React, { PropTypes } from 'react';
import Joi from 'joi';

import * as InputGroup from '../../../main/components/InputGroup';

const ApplicationiOS = React.createClass({
  propTypes: {
    application: PropTypes.shape({
      name: PropTypes.string,
      applicationKey: PropTypes.string,
      applicationSecret: PropTypes.string,
    }),
    onDataChange: PropTypes.func.isRequired,
    onInputBlur: PropTypes.func.isRequired,
    getValidationMessages: PropTypes.func.isRequired,
    renderHelpText: PropTypes.func.isRequired,
  },

  getValidatorTypes() {
    return {
      iOSApplicationName: Joi.string().allow(null).allow('').max(10).label('iOS Application Name'),
    };
  },

  getValidatorData() {
    return {
      iOSApplicationName: this.props.application.name,
    };
  },

  getDefaultProps() {
    return {
      application: {
        name: null,
        applicationKey: null,
        applicationSecret: null,
      },
    };
  },

  render() {
    return (
      <section>
        <InputGroup.Row>
          <InputGroup.Label>application name</InputGroup.Label>
          <InputGroup.Input>
            <input
                className="radius"
                type="text"
                name="iOSApplicationName"
                placeholder="application name"
                value={this.props.application.name}
                onChange={this.props.onDataChange}
                onBlur={this.props.onInputBlur}
              />
            {this.props.getValidationMessages('iOSApplicationName').map(this.props.renderHelpText)}
          </InputGroup.Input>
        </InputGroup.Row>
        <InputGroup.Row>
          <InputGroup.Label>application key</InputGroup.Label>
          <InputGroup.Input>
            <input
                className="radius"
                type="text"
                name="iOSApplicationKey"
                placeholder="application key"
                value={this.props.application.applicationKey}
                readOnly
              />
          </InputGroup.Input>
        </InputGroup.Row>
        <InputGroup.Row>
          <InputGroup.Label>application secret</InputGroup.Label>
          <InputGroup.Input>
            <input
                className="radius"
                type="text"
                name="iOSApplicationSecret"
                placeholder="application secret"
                value={this.props.application.applicationSecret}
                readOnly
              />
          </InputGroup.Input>
        </InputGroup.Row>
      </section>
    );
  },
});

export default ApplicationiOS;
