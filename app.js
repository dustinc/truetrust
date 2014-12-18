
/**
  * Module dependencies.
  */

var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    stylus = require('stylus'),
    mongoose = require('mongoose'),
    formage = require('formage'),
    _ = require('lodash'),
    models,
    db;


app = express();


/**
  * Custom Formage Fields
  */

formage.widgets.EmailWidget = formage.widgets.InputWidget.extend({
  init: function (options) {
    this._super('email', options);
  }
});

formage.fields.EmailField = formage.fields.BaseField.extend({
  init: function (options) {
    options = options || {};
    options.widget = options.widget || formage.widgets.EmailWidget;
    this._super(options);
    this.type = 'email';
  }
});


formage.widgets.PhoneWidget = formage.widgets.InputWidget.extend({
  init: function(options) {
    this._super('tel', options);
    this.attrs['pattern'] = '[\\(]\\d{3}[\\)]\\s{0,1}\\d{3}[\\-]\\d{4}';
    this.attrs['title'] = 'Format: (999)999-9999';
  }
});

formage.fields.PhoneField = formage.fields.BaseField.extend({
  init: function (options) {
    options = options || {};
    options.widget = options.widget || formage.widgets.PhoneWidget;
    this._super(options);
    this.type = 'tel';
  }
});


app.set('formage', formage);

app.set('formage_view_path', path.normalize(__dirname + '/views/formage'));


// all environments
app.set('env', process.env.NODE_ENV || 'development');
app.set('port', process.env.PORT || 3000);
app.set('mongo', process.env.MONGOLAB_URI || 'mongodb://localhost/truetrust');
app.set('view engine', 'jade');
app.set('views', path.normalize(__dirname + '/views'));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser('secret'));
app.use(express.cookieSession({cookie: { maxAge: 1000 * 60 * 60 * 24 }}));
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'public')));
app.use(stylus.middleware({ src: path.normalize(__dirname + '/styl'), dest: path.normalize(__dirname + '/public/admin') }));


models = require('./models');


// development only
if('development' == app.get('env')) {
  app.use(express.errorHandler());
}


// app routes
app.get('/', routes.index);


// connect to mongodb
db = mongoose.connect(app.get('mongo'));


// init formage admin app
var admin = formage.init(app, express, models, {
  title: 'True Trust Services',
  root: '/admin',
  admin_users_gui: true
});

admin.app.locals.global_head = '<style>\n.formage .nf_listfield_container > .field_label { font-size: inherit; font-weight: normal; }\n</style>';


admin.app.get('/model/:modelName/document/:documentId/statement', admin.app.controllers.authMiddleware('view'), function(req, res, next) {
  // get customer
  models.customer.findOne({ _id: req.params.documentId }, function(err, customer) {
    if(err) return next(err);

    // get payments
    models.customer_payment.find({ customer: req.params.documentId }).exec(function(err, payments) {
      var moment = require('moment');

      // render billing statement html
      admin.app.render('billing', { customer: customer, payments: payments, today_date: moment().format('MM/DD/YYYY'),  accounting: require('accounting') }, function(err, html) {
        var fs = require('fs'),
            pdf = require('html-pdf'),
            file_name = customer.customer_id+'-001.pdf';
        if(err) return next(err);

        // html to pdf
        pdf.create(html, {}, function(err, buffer) {
          if(err) return next(err);

          // write pdf to public dir
          fs.writeFile('./public/'+file_name, buffer, function(err) {
            if(err) return next(err);

            // download
            return res.redirect(req.protocol+'://'+req.get('host')+'/'+file_name);
          });
        });
      });
    });
  });
});


http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
