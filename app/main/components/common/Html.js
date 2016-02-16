import React from 'react';

import Version from './Version';

 // TODO may need to detect which file to import based on environment
import webpackConfig from '../../../../webpack.config.js';
import { baseUrl } from '../../../utils/url';
import { enabledHotloader } from '../../../utils/env';

let appUrl;
let bundleFile;
let bundlePath;

if (enabledHotloader()) {
  // use empty root path for client side, rely on relative path resolving
  appUrl = baseUrl(webpackConfig.custom.hotLoadPort);
  bundleFile =  'bundle.js';
  bundlePath = `${appUrl}/${bundleFile}`;
} else {
  bundlePath = '/javascript/bundle.js';
}

const Html = React.createClass({
  render() {
    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          <title>{this.props.title}</title>
          <link href="//fonts.googleapis.com/css?family=Roboto:500,300,700,400" rel="stylesheet" type="text/css" />
          <link rel="stylesheet" href="/stylesheets/iconic-fonts.css" />
          <link rel="stylesheet" href="/stylesheets/main.css" />
          <link rel="stylesheet" href="/vendor/react-date-picker/dist/react-datepicker.min.css" />
          <link rel="stylesheet" href="/stylesheets/map-sprite.css" />
          <script src="/vendor/foundation/js/vendor/modernizr.js"></script>
        </head>
        <body>
          <div id="app" dangerouslySetInnerHTML={{__html: this.props.markup}}></div>
          <Version />
          <script dangerouslySetInnerHTML={{__html: this.props.state}}></script>
          <script src="/vendor/jquery/dist/jquery.min.js"></script>
          <script src="/vendor/highmaps/adapters/standalone-framework.js"></script>
          <script src="/vendor/highmaps/highcharts.js"></script>
          <script src="/vendor/highmaps/modules/map.js"></script>
          <script src="/vendor/foundation/js/foundation.min.js"></script>
          <script src="/vendor/foundation/js/foundation/foundation.dropdown.js"></script>
          <script src={bundlePath} defer></script>
        </body>
      </html>
    );
  },
});

export default Html;
