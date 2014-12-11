
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
app.set('views', path.normalize(__dirname + '/views'));
app.set('view engine', 'jade');
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

app.get('/', routes.index);

// connect to mongodb
db = mongoose.connect(app.get('mongo'));


http.createServer(app).listen(app.get('port'), function() {
  var admin = formage.init(app, express, models, {
    title: 'True Trust Services',
    root: '/admin',
    admin_users_gui: true
  });

  admin.app.locals.global_head = '<style>\n.formage .nf_listfield_container > .field_label { font-size: inherit; font-weight: normal; }\n</style>';

  console.log('Express server listening on port ' + app.get('port'));
});
