import React from 'react';

var CompanyWidget = React.createClass({
  render: function() {
    return (
      <div className="large-15 large-centered columns">
        <div className="contents-panel">
          <div className="row">
            <div className="large-24 columns">
              <div className="contents-panel__title">
                <h4>widget config</h4>
              </div>
            </div>
            <div className="large-24 columns">
              <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
            </div>
            <div className="large-24 columns">
              <div className="large-9 columns">
                <label>widget 1</label>
              </div>
              <div className="large-15 columns">
                <input type="text" name="overview-widget-1" placeholder="url" />
              </div>
            </div>
            <div className="large-24 columns">
              <div className="large-9 columns">
                <label>widget 2</label>
              </div>
              <div className="large-15 columns">
                <input type="text" name="overview-widget-2" placeholder="url" />
              </div>
            </div>
            <div className="large-24 columns">
              <div className="large-9 columns">
                <label>widget 3</label>
              </div>
              <div className="large-15 columns">
                <input type="text" name="overview-widget-3" placeholder="url" />
              </div>
            </div>
            <div className="large-24 columns">
              <div className="large-9 columns">
                <label>widget 4</label>
              </div>
              <div className="large-15 columns">
                <input type="text" name="overview-widget-4" placeholder="url" />
              </div>
            </div>
            <div className="large-24 columns">
              <div className="large-9 columns">
                <label>widget 5</label>
              </div>
              <div className="large-15 columns">
                <input type="text" name="overview-widget-5" placeholder="url" />
              </div>
            </div>
            <div className="large-24 columns">
              <div className="large-9 columns">
                <label>widget 6</label>
              </div>
              <div className="large-15 columns">
                <input type="text" name="overview-widget-6" placeholder="url" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
});

export default CompanyWidget;
