// customers

var mongoose = require('mongoose'),

    SchemaTypes = mongoose.Schema.Types,

    formage = app.get('formage'),

    // email
    email = new mongoose.Schema({
      email: { type: String, formageField: formage.fields.EmailField },
      is_main: { type: Boolean, default: false }
    }),

    // phone
    phone = new mongoose.Schema({
      number: { type: String, formageField: formage.fields.PhoneField },
      type: { type: String }
    }),

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
      other_phones: [phone],
      email: { type: String, formageField: formage.fields.EmailField },
      other_emails: [email],
      addresses: [address],
      referred_by: { type: String },
      sales_associate: { type: String },
      quote: { type: Number },
      annual_fee: { type: Number },
      payment_plan: { type: String },
      balance: { type: Number },
      balance_past_due: { type: String, enum: ['30 DAYS PAST DUE', '60 DAYS PAST DUE', '90+ DAYS PAST DUE'] },
      customer_id: { type: String },
      member_level: { type: String },
      healthcare_directive: { type: String }
    }),
    model;


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
  search: ['first_name', 'last_name', 'email', 'phone']
};


module.exports = model;
