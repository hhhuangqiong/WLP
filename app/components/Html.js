'use strict';
import React from 'react';

 //TODO may need to detect which file to import based on environment
import webpackConfig from '../../webpack.config.js';

const bundlePath = 'http://localhost:' + (process.env.HOT_LOAD_PORT || webpackConfig.custom.hotLoadPort) + '/bundle.js';

var Html = React.createClass({

  render: function() {
    return (
      <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge"  />
        <title>{this.props.title}</title>
        <link href="http://fonts.googleapis.com/css?family=Roboto:500,300,700,400" rel="stylesheet" type="text/css" />
        <link rel="stylesheet" href="/stylesheets/iconic-fonts.css" />
        <link rel="stylesheet" href="/stylesheets/main.css" />
        <link rel="stylesheet" href="/vendor/jquery-ui/themes/base/jquery-ui.css" />
      </head>
      <body>
      <div id="app" dangerouslySetInnerHTML={{__html: this.props.markup}}></div>
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
