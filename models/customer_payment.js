
var mongoose = require('mongoose'),
    SchemaTypes = mongoose.Schema.Types,

    schema = new mongoose.Schema({
      customer: { type: mongoose.Schema.ObjectId, ref: 'customer', required: true },
      date: { type: Date },
      amount: { type: Number },
      type: { type: String, enum: ['Check', 'Credit Card', 'Cash', 'Direct Deposit', 'Wire Transfer', 'PayPal'] },
      check_number: { type: String },
      account_name: { type: String },
      account_last_four: { type: Number },
      authorization: { type: String },
      wire_transfer_confirmation: { type: String },
    }),
    model;



model = mongoose.model('customer_payment', schema);

model.formage = {
  section: 'Customer',
  label: 'Customer Payments'
};

module.exports = model;
