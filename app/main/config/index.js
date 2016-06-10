module.exports = {
  inputDateFormat: process.env.INPUT_DATE_FORMAT || 'L',
  displayDateFormat: process.env.DISPLAY_DATE_FORMAT || 'LL LTS',
  pages: {
    topUp: {
      pageRec: 50,
    },
    endUser: {
      pageRec: 10,
    },
  },
};
