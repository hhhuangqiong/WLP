'use strict';
import React from 'react';

import Version from './common/Version';

 //TODO may need to detect which file to import based on environment
import webpackConfig from '../../webpack.config.js';

import {baseUrl} from '../utils/url';

const appUrl = baseUrl(webpackConfig.custom.hotLoadPort, process.env.APP_HOST);
const bundleFile = process.env.NODE_ENV === 'production' ?  'javascript/bundle.js':'bundle.js' ;
const bundlePath = `${appUrl}/${bundleFile}`;

var Html = React.createClass({

  render: function() {
    return (
      <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge"  />
        <title>{this.props.title}</title>
        <link href="http://fonts.googleapis.com/css?family=Roboto:500,300,700,400" rel="stylesheet" type="text/css" />
        <link rel="stylesheet" href="/stylesheets/iconic-fonts.css" />
        <link rel="stylesheet" href="/stylesheets/main.css" />
        <link rel="stylesheet" href="/vendor/react-date-picker/dist/react-datepicker.min.css" />
        <link rel="stylesheet" href="/vendor/jquery-ui/themes/base/jquery-ui.css" />
        <link rel="stylesheet" href="/stylesheets/map-sprite.css" />
      </head>
      <body>
        <div id="app" dangerouslySetInnerHTML={{__html: this.props.markup}}></div>
        <Version />
      </body>
      <script dangerouslySetInnerHTML={{__html: this.props.state}}></script>
      <script src="/vendor/jQuery/dist/jquery.js"></script>
      <script src="/vendor/modernizr/modernizr.js"></script>
      <script src="/vendor/foundation/js/foundation.js"></script>
      <script src="/vendor/jquery-ui/ui/datepicker.js"></script>
      <script src={bundlePath} defer></script>
      </html>
    );
  }
});

export default Html;
