// customers

var mongoose = require('mongoose'),

    SchemaTypes = mongoose.Schema.Types,

    formage = app.get('formage'),

    money = require('./../lib/money'),

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
      quote: { type: String, get: money.format, set: money.unformat },
      annual_fee: { type: String, get: money.format, set: money.unformat },
      plan_payment_amount: { type: String, get: money.format, set: money.unformat },
      plan_payment_cycle: { type: String, enum: ['Monthly', 'Quarterly', 'Annually'] },
      balance: { type: String, get: money.format, set: money.unformat },
      balance_past_due: { type: String, enum: ['30 DAYS PAST DUE', '60 DAYS PAST DUE', '90+ DAYS PAST DUE'] },
      balance_past_due_30_days: { type: String, get: money.format, set: money.unformat },
      balance_past_due_60_days: { type: String, get: money.format, set: money.unformat },
      balance_past_due_90_plus_days: { type: String, get: money.format, set: money.unformat },
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

schema.virtual('total_due').get(function() {
  var accounting = require('accounting'),
      total = accounting.unformat(this.plan_payment_amount)
            + accounting.unformat(this.balance_past_due_30_days || 0)
            + accounting.unformat(this.balance_past_due_60_days || 0)
            + accounting.unformat(this.balance_past_due_90_plus_days || 0);
  return accounting.formatMoney(total);
});


// methods
schema.methods.toString = function() {
  return this.first_name + ' ' + this.last_name + ' ' + this.customer_id;
};


// statics


// create billing statement for each looped id
schema.statics.createBillingStatements = function(ids, cb) {
  var _ = require('lodash'),
      messages = [],
      self = this;
  _.each(ids, function(id, i) {
    self.model('customer').createBillingStatement(id, null, function(err, message) {
      if(err) return cb(err);
      messages.push(message);
      // final id processed; init cb
      if(ids.length == i+1) {
        console.log('ids.length', ids.length, 'i+1', i+1);
        cb(null, messages);
      }
    });
  });
};


// create billing statement
schema.statics.createBillingStatement = function(id, comment, cb) {
  var admin = app.get('admin'),
      models = app.get('models'),
      root_url = app.get('root_url'),
      _ = require('lodash');


  models.customer.findOne({ _id: id }, function(err, customer) {
    if(err) return cb(err);

    // get payments
    models.customer_payment.find({ customer: id }).exec(function(err, payments) {

      // get incremented customer statement id
      models.counter.increment(customer.customer_id, function(err, counter) {
        if(err) return cb(err);

        var moment = require('moment'),
            statement_id = customer.customer_id + '-' + counter.seq,
            today_date = moment().format('MM/DD/YYYY'),
            bindings = {
              customer: customer,
              payments: payments,
              comment: comment,
              statement_id: statement_id,
              moment: moment,
              today_date: today_date,
              money: require('./../lib/money'),
              root_url: root_url
            };

        // render billing statement html
        admin.app.render('billing', bindings, function(err, html) {
          var file_name = statement_id+'.pdf';
              file_path = root_url + '/' + file_name;

          if(err) return cb(err);

          var customer_statement = new models.customer_statement({
            statement_id: statement_id,
            customer: customer._id,
            customer_name: customer.full_name,
            html: html,
            file_path: file_path,
          });

          customer_statement.save(function(err) {
            if(err) return cb(err);
            cb(null, 'Statement created for: '+customer.full_name);
          });

        });
      });
    });
  });

}


// pre save
schema.pre('save', function(next) {
  var self = this;
  if(!this.billing_statement) return next();
  // create new billing statement if billing_statement is true
  this.model('customer').createBillingStatement(this._id, this.billing_statement_comment, function(err,  message) {
    // clear for next billing
    self.billing_statement = false;
    self.billing_statement_comment = '';
    next();
  });
});



// init model
model = mongoose.model('customer', schema);


// model formage settings
model.formage = {
  section: 'Customer',
  label: 'Customers',
  list: ['first_name', 'last_name', 'email', 'phone'],
  search: ['first_name', 'last_name', 'email', 'other_emails', 'phone']
};


module.exports = model;
