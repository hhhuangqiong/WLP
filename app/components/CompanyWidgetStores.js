import React from 'react';

var CompanyWidgetStores = React.createClass({
  render: function() {
    return (
      <div>
        <div className="large-24 columns">
          <p>stores</p>
        </div>
        <div className="large-24 columns">
          <div className="large-9 columns">
            <label>widget 1</label>
          </div>
          <div className="large-15 columns">
            <input type="text" name="stores-widget-1" placeholder="url" />
          </div>
        </div>
        <div className="large-24 columns">
          <div className="large-9 columns">
            <label>widget 2</label>
          </div>
          <div className="large-15 columns">
            <input type="text" name="stores-widget-2" placeholder="url" />
          </div>
        </div>
        <div className="large-24 columns">
          <div className="large-9 columns">
            <label>widget 3</label>
          </div>
          <div className="large-15 columns">
            <input type="text" name="stores-widget-3" placeholder="url" />
          </div>
        </div>
        <div className="large-24 columns">
          <div className="large-9 columns">
            <label>widget 4</label>
          </div>
          <div className="large-15 columns">
            <input type="text" name="stores-widget-4" placeholder="url" />
          </div>
        </div>
        <div className="large-24 columns">
          <div className="large-9 columns">
            <label>widget 5</label>
          </div>
          <div className="large-15 columns">
            <input type="text" name="stores-widget-5" placeholder="url" />
          </div>
        </div>
        <div className="large-24 columns">
          <div className="large-9 columns">
            <label>widget 6</label>
          </div>
          <div className="large-15 columns">
            <input type="text" name="stores-widget-6" placeholder="url" />
          </div>
        </div>
      </div>
    )
  }
});

export default CompanyWidgetStores;
