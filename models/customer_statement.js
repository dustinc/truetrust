// statements

var mongoose = require('mongoose'),
    moment = require('moment'),
    formatDate = function(d) {
      if(!d) return '';
      return moment(d).format('MM/DD/YYYY');
    },

    schema = new mongoose.Schema({
      date: { type: Date, default: new Date },
      statement_id: { type: String },
      customer: { type: mongoose.Schema.ObjectId, ref: 'customer', required: true },
      customer_name: { type: String },
      comments: { type: String },
      html: { type: mongoose.Schema.Types.Mixed }
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

schema.post('save', function() {
  console.log('POST SAVE customer_statement', this.statement_id, this.customer);
  this.model('customer').update({ _id: this.customer }, { $addToSet: { statements: this._id } }, function(err, num) {
    console.log('updated customer.statements', err, num);
  });
});




model = mongoose.model('customer_statement', schema);


model.formage = {
  section: 'Customer',
  label: 'Customer Statements',
  list_populate: ['customer'],
  search: ['statement_id', 'date', 'customer_name']
};

module.exports = model;
