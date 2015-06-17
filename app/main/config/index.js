module.exports = {
  inputDateFormat: process.env.INPUT_DATE_FORMAT || 'L',
  displayDateFormat: process.env.DISPLAY_DATE_FORMAT || 'MMMM DD YYYY, hh:mm:ss a',
  pages: {
    topUp: {
      pageRec: 50
    },
    endUser: {
      pageRec: 10
    }
  }
};
