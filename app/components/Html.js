'use strict';
import React from 'react';

var Html = React.createClass({
  render: function() {
    return (
      <html>
      <head>
        <meta charSet="utf-8" />
        <title>{this.props.title}</title>
        <meta name="viewport" content="width=device-width, user-scalable=no" />
        <link href="http://fonts.googleapis.com/css?family=Roboto:500,300,700,400" rel="stylesheet" type="text/css" />
        <link rel="stylesheet" href="/stylesheets/iconic-fonts.css" />
        <link rel="stylesheet" href="/stylesheets/main.css" />
        <link rel="stylesheet" href="/vendor/react-datepicker/react-date-picker.css" />
      </head>
      <body>
      <div id="app" dangerouslySetInnerHTML={{__html: this.props.markup}}></div>
      </body>
      <script dangerouslySetInnerHTML={{__html: this.props.state}}></script>
      <script src="/vendor/jQuery/dist/jquery.js"></script>
      <script src="/vendor/modernizr/modernizr.js"></script>
      <script src="/vendor/foundation/js/foundation.js"></script>
      <script src="/javascript/bundle.js" defer></script>
      </html>
    );
  }
});

export default Html;
