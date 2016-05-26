# install

## npm

install the package directly from github with npm

```
npm install git@github.com:coursera/foody.git
```

## configure foody 

copy config.js.template.txt into your module and add in your own parameters to authenticate to algolia

below are the params you will need to define

```
module.exports = {
  slack: {
    apiToken: '',
    token: 'x',
    webhook: '',
    botName: 'foody',
    botIconEmoji: 'bread',
  },
  www: {
    username: '',
    password: '',
    sessionSecret: '',
    base: 'foody',
    url: ''
  },
  database: '/path/to/data/foody.sqlite',
  environment: 'development'
};
```

## create your initial sqlite tables

```
const sqlite = require('sqlite3');
const db = new sqlite.Database('foody.sqlite');

db.run('create table dish (id integer primary key, served_on date, title varchar(255), description text, caterer tinyint, meal tinyint)');
db.run('create table restriction (id integer primary key, title varchar(255), color text)');
db.run('CREATE TABLE meal (id integer primary key, title varchar(255), required tinyint, starttime time, endtime time)');
db.run('create table caterer (id integer primary key, title varchar(255), website text)');
db.run('create table dish_to_restriction (dish_id integer, restriction_id integer)');
```

## wire up this router to an existing express server

this module exposes a modular express router that can be wired up to any existing express router. 

here is an example of how to do that:

```
  var express = require('express');
  var app = express();
  var bodyParser = require('body-parser');
  var fs = require('fs');
  var path = require('path');
  var vhost = require('vhost');
  var foody = require('foody');
  var foodyConfig = require('./config.foody.js');

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use('/foody', foody(foodyConfig));

  var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;
  });
```
