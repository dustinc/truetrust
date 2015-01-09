
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

app.use(function(req, res, next) {
  if(app.get('root_url')) return next();
  app.set('root_url', req.protocol+'://'+req.get('host'));
  next();
});


models = require('./models');

app.set('models', models);


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

var setParam = function(k, v) {
  return function(req, res, next) {
    req.params[k] = v;
    next();
  }
};


// open/download most recent customer statement
admin.app.get('/model/customer/document/:documentId/statement/:statementAction', setParam('modelName', 'customer_statement'), admin.app.controllers.authMiddleware('view'), function(req, res, next) {

  models.customer_statement.getRecentByCustomer(req.params.documentId, function(err, statement) {
    if(err) return next(err);
    if(!statement) return next(new Error('No Statements for customer ' + req.params.documentId));

    if(req.params.statementAction == 'open') {
      return res.send(statement.html);
    }
    else if(req.params.statementAction == 'download') {

      var pdf = require('html-pdf'),
          filename = statement.statement_id+'.pdf'

      // html to pdf
      pdf.create(statement.html, {}, function(err, buffer) {
        if(err) return next(err);

        res.status(200);
        res.set({
          'Content-Type': 'application/pdf',
          'Access-Control-Allow-Origin': '*',
          'Content-Disposition': 'inline; filename='+filename
        });
        res.send(buffer);

      });

    }

  });

});


// open/download statement by id
admin.app.get('/model/customer_statement/document/:documentId/:statementAction', setParam('modelName', 'customer_statement'), admin.app.controllers.authMiddleware('view'), function(req, res, next) {
  models.customer_statement.findOne({ _id: req.params.documentId }, function(err, statement) {
    if(err) return next(err);
    if(!statement) return next(new Error('Statement: '+ req.params.documentId +' not found.'));

    if(req.params.statementAction == 'open') {
      return res.send(statement.html);
    }
    else if(req.params.statementAction == 'download') {

      var pdf = require('html-pdf'),
          filename = statement.statement_id+'.pdf'

      // html to pdf
      pdf.create(statement.html, {}, function(err, buffer) {
        if(err) return next(err);

        res.status(200);
        res.set({
          'Content-Type': 'application/pdf',
          'Access-Control-Allow-Origin': '*',
          'Content-Disposition': 'inline; filename='+filename
        });
        res.send(buffer);

      });

    }

  });
});

app.set('admin', admin);

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
