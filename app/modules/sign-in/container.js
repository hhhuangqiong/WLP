import React, { PropTypes, Component } from 'react';
import { connectToStores } from 'fluxible-addons-react';
import Joi from 'joi';

import SignInStore from './store';
import SignIn from './components/SignIn';

export default connectToStores(
  SignIn,
  [SignInStore],
  context => ({ ...(context.getStore(SignInStore).getState()) })
);
