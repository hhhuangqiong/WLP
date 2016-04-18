import React, { PropTypes } from 'react';

import Version from './Version';
import { baseUrl } from '../../../utils/url';
import { enabledHotloader, hotloadPort } from '../../../utils/env';

let bundlePath;

if (enabledHotloader()) {
  // use empty root path for client side, rely on relative path resolving
  const appUrl = baseUrl(hotloadPort);
  const bundleFile = 'bundle.js';
  bundlePath = `${appUrl}/${bundleFile}`;
} else {
  bundlePath = '/javascript/bundle.js';
}

const Html = props => (
    <html lang={props.lang}>
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <title>{props.title}</title>
      <link
        href="//fonts.googleapis.com/css?family=Roboto:500,300,700,400"
        rel="stylesheet"
        type="text/css"
      />
      <link rel="stylesheet" href="/stylesheets/iconic-fonts.css" />
      <link rel="stylesheet" href="/stylesheets/main.css" />
      <link rel="stylesheet" href="/vendor/react-date-picker/dist/react-datepicker.min.css" />
      <link rel="stylesheet" href="/stylesheets/map-sprite.css" />
      <script src="/vendor/foundation/js/vendor/modernizr.js"></script>
    </head>
    <body>
    <div id="app" dangerouslySetInnerHTML={{ __html: props.markup }}></div>
    <Version />
    <script dangerouslySetInnerHTML={{ __html: props.state }}></script>
    <script dangerouslySetInnerHTML={{ __html: props.config }}></script>
    <script dangerouslySetInnerHTML={{ __html: props.locale }}></script>
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

Html.propTypes = {
  markup: PropTypes.element.isRequired,
  state: PropTypes.object,
  lang: PropTypes.string,
  title: PropTypes.string,
  config: PropTypes.string,
  locale: PropTypes.string,
};

export default Html;
