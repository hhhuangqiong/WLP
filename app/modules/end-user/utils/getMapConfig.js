export default (containerId, data, maxNumber) => {
  return {
    chart: {
      renderTo: containerId
    },

    title: '',

    exporting: {
      enabled: false
    },

    credits: {
      enabled: false
    },

    colorAxis: {
      min: 1,
      max: maxNumber,
      minColor: '#F1C6C0',
      maxColor: '#F03339',
      type: 'logarithmic',
      gridLineWidth: 1,
      gridLineColor: 'white',
      minorTickInterval: 0.1,
      minorGridLineColor: 'white',
      tickLength: 0
    },

    series : [{
      data : data,
      mapData: Highcharts.maps['custom/world'],
      joinBy: ['iso-a2', 'code'],
      animation: true,
      name: 'Number of attemps',
      states: {
        hover: {
          color: '#BADA55'
        }
      }
    }]

  };
};
