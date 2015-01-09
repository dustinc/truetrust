
var moment = require('moment');

exports.format = function(val) {
  if(!val) return '';
  return moment(val).format('MM/DD/YYYY');
};
