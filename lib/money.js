
var accounting = require('accounting');

exports.format = accounting.formatMoney;

exports.unformat = function(val) {
  return accounting.unformat(val);
};

// sets initial total then returns pre-deducted total for each amount
// in use by views/formage/billing.jade
exports.deduct = function(total) {
  var total = accounting.unformat(total);
  return function(amount) {
    var ret = total;
    total = total - accounting.unformat(amount);
    return accounting.formatMoney(ret);
  };
};
