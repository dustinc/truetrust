// customers

var mongoose = require('mongoose'),

    SchemaTypes = mongoose.Schema.Types,

    formage = app.get('formage'),

    // asset
    asset = new mongoose.Schema({
      asset_type: { type: String, enum: ['House', 'Stock', 'Business'] },
      approx_value: { type: String },
      trustee: { type: String },
      successor_ttee: { type: String },
      beneficiaries: [{ type: String }],
      protector: { type: String },
      name_of_trust: { type: String },
      type_of_trust: { type: String, enum: ['Living Trust', 'Private Asset Protection Trust'] },
      ein_number: { type: Number },
      five_zero_one_c: { type: String },
      registration_number: { type: String },
      funded: { type: String },
      ucc1: { type: String },
      status: { type: String, enum: ['Completed', 'Incomplete', 'Wait'] },
      notes: [{ type: SchemaTypes.Text }]
    }),

    // payment
    payment = new mongoose.Schema({
      date: { type: Date },
      amount: { type: Number },
      type: { type: String, enum: ['Check', 'Credit Card', 'Cash', 'Direct Deposit', 'Wire Transfer', 'PayPal'] },
      check_number: { type: String },
      account_name: { type: String },
      account_last_four: { type: Number },
      authorization: { type: String },
      wire_transfer_confirmation: { type: String },
    }),

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
      assests: [asset],
      payments: [payment],
      quote: { type: Number },
      annual_fee: { type: Number },
      payment_plan: { type: String },
      balance: { type: Number },
      balance_past_due: { type: String, enum: ['30 DAYS PAST DUE', '60 DAYS PAST DUE', '90+ DAYS PAST DUE'] },
      customer_id: { type: String },
      member_level: { type: String },
      healthcare_directive: { type: String }
    }),

    model = mongoose.model('Customer', schema);


model.formage = {

  section: 'Customer',

  list: ['first_name', 'last_name', 'email', 'phone'],

  search: ['first_name', 'last_name', 'email', 'phone']

};


module.exports = model;
