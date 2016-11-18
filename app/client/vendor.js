import 'jquery';
import 'expose-loader?HighchartsAdapter!highmaps-release/adapters/standalone-framework.src';
import 'expose-loader?Highcharts!highmaps-release/highcharts.src';
import map from 'highmaps-release/modules/map.src';
map(Highcharts);
import 'foundation-sites/js/foundation';
import 'foundation-sites/js/foundation/foundation.dropdown';
