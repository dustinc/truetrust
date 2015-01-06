// customers

var mongoose = require('mongoose'),

    SchemaTypes = mongoose.Schema.Types,

    formage = app.get('formage'),

    // address
    address = new mongoose.Schema({
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zip: { type: String }
    }),

    // Customer Schema
    schema = new mongoose.Schema({
      first_name: { type: String, required: true },
      last_name: { type: String, required: true },
      other_names: { type: String },
      phone: { type: String, formageField: formage.fields.PhoneField },
      other_phones: [{ type: String, formageField: formage.fields.PhoneField }],
      email: { type: String, formageField: formage.fields.EmailField },
      other_emails: [{ type: String, formageField: formage.fields.EmailField }],
      addresses: [address],
      referred_by: { type: String },
      sales_associate: { type: String },
      quote: { type: Number },
      annual_fee: { type: Number },
      payment_plan: { type: String },
      balance: { type: Number },
      balance_past_due: { type: String, enum: ['30 DAYS PAST DUE', '60 DAYS PAST DUE', '90+ DAYS PAST DUE'] },
      balance_past_due_30_days: { type: Number },
      balance_past_due_60_days: { type: Number },
      balance_past_due_90_plus_days: { type: Number },
      customer_id: { type: String },
      member_level: { type: String },
      healthcare_directive: { type: String },
      billing_statement: { type: Boolean, default: false, label: 'Create Billing Statement Upon Saving?' },
      billing_statement_comment: { type: String, widget: 'TextAreaWidget' }
    }),
    model;


schema.virtual('full_name').get(function() {
  return this.first_name + ' ' + this.last_name;
});


// methods
schema.methods.toString = function() {
  return this.first_name + ' ' + this.last_name;
};

// init model
model = mongoose.model('customer', schema);


// model formage settings
model.formage = {
  section: 'Customer',
  label: 'Customers',
  list: ['first_name', 'last_name', 'email', 'phone'],
  search: ['first_name', 'last_name', 'email', 'other_emails', 'phone'],
  actions: [
    {
      id: 'billing_statement',
      label: 'Create New Billing Statement',
      redirect_append: '/statement',
      func: function(user, ids, cb) {
        cb();
      }
    }
  ]
};


module.exports = model;
