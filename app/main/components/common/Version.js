import React from 'react';
import pkg from '../../../../package.json';

//TODO ensure 'z-index' is large enough
let style = {
  position: 'fixed',
  left: 0,
  bottom: 0,
  zIndex: 999,
  opacity: 0.4
};

module.exports = React.createClass({
  render: function(){
    return (
      <div style={style}>{pkg.version}</div>
    );
  }
});
