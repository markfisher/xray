var basicAuth = require('node-basicauth');
var express = require('express');
var fs = require('fs');
var Application = require('../app/components/application');
var React = require('react');
var Layout = require('./components/layout');
var app = express();
var {getCredentials} = require('../app/helpers/url_helper');

const XRAY_USER = process.env.XRAY_USER;
const XRAY_PASSWORD = process.env.XRAY_PASSWORD;
if (XRAY_USER && XRAY_PASSWORD) {
  app.use(basicAuth({[XRAY_USER]: XRAY_PASSWORD}));
}

app.use(express.static(__dirname + '/../public'));
app.use(express.static(__dirname + '/../vendor/pui-v1.4.0'));

function getReceptorCredentials(receptorUrl) {
  if (!receptorUrl) return;
  var {user, password} = getCredentials(receptorUrl);
  return new Buffer(`${user}:${password}`).toString('base64');
}

app.get('/', function(req, res) {
  var receptorUrl = req.query.receptor || process.env.RECEPTOR_URL;
  var scripts = ['application.js'];
  var stylesheets = ['reset.css', 'pivotal-ui.min.css', 'application.css'];
  var colors = JSON.parse(fs.readFileSync('config/colors.json'));
  var config = {receptorUrl, colors};
  var props = {entry: Application, scripts, stylesheets, config, className: 'bg-neutral-1'};
  var html = React.renderToStaticMarkup(<Layout {...props}/>);

  var receptorAuthorization = getReceptorCredentials(receptorUrl);
  var result = res
    .status(200)
    .type('html');
  if (receptorAuthorization) result.cookie('receptor_authorization', receptorAuthorization);
  result
    .send(`<!DOCTYPE html>${html}`);
});

module.exports = app;