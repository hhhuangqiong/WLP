import React, { PropTypes, createFactory } from 'react';
import classNames from 'classnames';
import {
  FormattedMessage,
  defineMessages,
  injectIntl,
  intlShape,
} from 'react-intl';

import { HOME } from '../../utils/paths';
import Menu from './common/NavigationMenu';

const ERROR_NAMES = defineMessages({
  401: {
    id: '401',
    defaultMessage: 'access denied',
  },
  404: {
    id: '404',
    defaultMessage: 'page not found',
  },
  500: {
    id: '500',
    defaultMessage: 'internal server error',
  },
});

const ERROR_MESSAGES = defineMessages({
  401: {
    id: '401Messages',
    defaultMessage: 'you don\'t have permission to access the resource. ',
  },
  404: {
    id: '404Messages',
    defaultMessage: 'the page is not available. ',
  },
  500: {
    id: '500Message',
    // eslint-disable-next-line max-len
    defaultMessage: 'there is a problem with the resource you are looking for, and it cannot be displayed. ',
  },
});

const ERRORS = {
  401: {
    code: 401,
    name: ERROR_NAMES['401'],
    message: ERROR_MESSAGES['401'],
  },
  404: {
    code: 404,
    name: ERROR_NAMES['404'],
    message: ERROR_MESSAGES['404'],
  },
  500: {
    code: 500,
    name: ERROR_NAMES['500'],
    message: ERROR_MESSAGES['500'],
  },
};

const ErrorTemplate = (props) => {
  const { formatMessage } = props.intl;
  const { code, name, message } = props;

  return (
    <div className="full-height">
      <nav className="top-bar public-header" data-topbar role="navigation">
        <ul className="title-area public-header__title-area">
          <li className="logo public-header__logo">
            <img className="logo" src="/images/logo-default-m800.png" />
          </li>
        </ul>
        <Menu />
      </nav>
      <div className="public-container large-24 columns">
        <div className="row">
          <div className="large-10 columns large-centered">
            <div className="system-error">
              <div className="large-6 columns text-center">
                <i className={
                    classNames(
                      'system-error__icon',
                      {
                        'icon-error': code === 401,
                        'icon-error3': code === 404,
                        'icon-error4': code === 500,
                      }
                    )}
                />
              </div>
              <div className="system-error__message large-18 columns">
                <ul>
                  <li className="error-code">{code}</li>
                  <li className="error-name">{formatMessage(name)}</li>
                  <li className="error-message">
                    {formatMessage(message)}
                    <FormattedMessage
                      id="click"
                      defaultMessage="Click"
                    />
                    <a href={HOME}>
                      <FormattedMessage
                        id="here"
                        defaultMessage="Here"
                      />
                    </a>
                    <FormattedMessage
                      id="goBackToDashboard"
                      defaultMessage="to go back to dashboard"
                    />
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ErrorTemplate.propTypes = {
  intl: intlShape.isRequired,
  code: PropTypes.number.isRequired,
  name: PropTypes.object.isRequired,
  message: PropTypes.object.isRequired,
};

ErrorTemplate.defaultProps = ERRORS['500'];

const errorFactory = createFactory(injectIntl(ErrorTemplate));

export const Error401 = () => errorFactory(ERRORS['401']);
export const Error404 = () => errorFactory(ERRORS['404']);
export const Error500 = () => errorFactory(ERRORS['500']);
