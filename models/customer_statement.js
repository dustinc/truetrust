// statements

var mongoose = require('mongoose'),
    moment = require('moment'),
    date = require('./../lib/date'),
    createLink = function(href, text) {
      return '<a href="/admin/model/customer_statement/document' + href + '" target="_blank">' + text + '</a>'
    },

    schema = new mongoose.Schema({
      date: { type: Date, default: new Date, get: date.format },
      statement_id: { type: String },
      customer: { type: mongoose.Schema.ObjectId, ref: 'customer', required: true },
      customer_name: { type: String },
      html: { type: mongoose.Schema.Types.Mixed },
      open: {
        type: mongoose.Schema.Types.Html,
        get: function(val) {
          return createLink('/' + this._id.toString() + '/open', this.statement_id);
        }
      },
      download: {
        type: mongoose.Schema.Types.Html,
        get: function(val) {
          var text = this.statement_id + '.pdf';
          return createLink('/' + this._id.toString() + '/download', text);
        }
      }
    }),
    model;


schema.statics.getRecentByCustomer = function(id, cb) {
  this.find({ customer: id }).sort({ statement_id: -1 }).limit(1).exec(function(err, statement) {
    if(!statement) return cb(new Error('Statement for Customer _id ' + id + ' not found.'));
    return cb(err, statement[0]);
  });
};


schema.methods.toString = function() {
  return this.statement_id;
};


model = mongoose.model('customer_statement', schema);


model.formage = {
  section: 'Customer',
  label: 'Customer Statements',
  list: ['statement_id', 'date', 'customer', 'download'],
  list_populate: ['customer'],
  search: ['statement_id', 'date', 'customer_name']
};

module.exports = model;
