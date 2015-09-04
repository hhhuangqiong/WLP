// the application IDs used in the verification details page
let mockData = ["38275619", "23778495", "24551235", "26371187", "27563658"];

export default function (context, params, done) {
  context.dispatch('FETCH_APP_IDS_START');

  // timeout to simulate RTT
  setTimeout(function () {
    context.dispatch('FETCH_APP_IDS_SUCCESS', mockData);
    done();
  }, 100);
};
