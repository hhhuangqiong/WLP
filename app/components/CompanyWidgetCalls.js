import React from 'react';

var CompanyWidgetCalls = React.createClass({
  render: function() {
    return (
      <div>
        <div className="large-24 columns">
          <p>calls</p>
        </div>
        <div className="large-24 columns">
          <div className="large-9 columns">
            <label>widget 1</label>
          </div>
          <div className="large-15 columns">
            <input type="text" name="calls-widget-1" placeholder="url" />
          </div>
        </div>
        <div className="large-24 columns">
          <div className="large-9 columns">
            <label>widget 2</label>
          </div>
          <div className="large-15 columns">
            <input type="text" name="calls-widget-2" placeholder="url" />
          </div>
        </div>
        <div className="large-24 columns">
          <div className="large-9 columns">
            <label>widget 3</label>
          </div>
          <div className="large-15 columns">
            <input type="text" name="calls-widget-3" placeholder="url" />
          </div>
        </div>
        <div className="large-24 columns">
          <div className="large-9 columns">
            <label>widget 4</label>
          </div>
          <div className="large-15 columns">
            <input type="text" name="calls-widget-4" placeholder="url" />
          </div>
        </div>
        <div className="large-24 columns">
          <div className="large-9 columns">
            <label>widget 5</label>
          </div>
          <div className="large-15 columns">
            <input type="text" name="calls-widget-5" placeholder="url" />
          </div>
        </div>
        <div className="large-24 columns">
          <div className="large-9 columns">
            <label>widget 6</label>
          </div>
          <div className="large-15 columns">
            <input type="text" name="calls-widget-6" placeholder="url" />
          </div>
        </div>
      </div>
    )
  }
});

export default CompanyWidgetCalls;
