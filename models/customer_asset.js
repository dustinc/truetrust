// customer asset
var mongoose = require('mongoose'),

    SchemaTypes = mongoose.Schema.Types,

    schema = new mongoose.Schema({
      customer: { type: mongoose.Schema.ObjectId, ref: 'customer', required: true },
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
    model;




// init model
model = mongoose.model('customer_asset', schema);


// model formage settings
model.formage = {
  section: 'Customer',
  label: 'Customer Assets',
  search: ['asset_type', 'status']
};

module.exports = model;
