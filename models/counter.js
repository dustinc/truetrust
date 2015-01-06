
var mongoose = require('mongoose'),
    schema= module.exports = new mongoose.Schema({
      _id: { type: String, required: true },
      seq: { type: Number, default: 101 }
    }),
    model;


schema.statics.increment = function (id, callback) {
  var self = this;
  this.findOne({ _id: id }, function(err, counter) {
    if(err) return callback(err);
    if(!counter) {
      var counter = new self({ _id: id });
    } else {
      counter.seq++;
    }
    counter.save(function(err) {
      return callback(err, counter);
    });
  });
};

model = mongoose.model('counter', schema);

model.formage = {
  section: 'Meta',
  hidden: true
};

module.exports = model;
