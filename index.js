"use strict";

const express = require('express');
const router = express.Router({ strict: true }); // eslint-disable-line new-cap
const fs = require('fs');
const db = require('./data/db');
const path = require('path');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const pug = require('pug');
const session = require('express-session');

module.exports = (config) => {

  db.connect(config.database); // kick off sqlite connection

  router.use('/www', express.static(path.join(__dirname, 'www')));

  if (config.environment === 'development') {
    const webpack = require('webpack');
    const webpackMiddleware = require('webpack-dev-middleware');
    const compiler = webpack(require('./webpack.config.dev.js'));
    router.use(webpackMiddleware(compiler, { publicPath: '/www/js/', stats: { colors: true } }));
  }

  router.use(session({
    secret: config.www.sessionSecret,
    resave: false,
    saveUninitialized: true,
  }));
  router.use(passport.initialize());
  router.use(passport.session());

  passport.use(new BasicStrategy((userid, password, done) => {
    if (userid === config.www.username && password === config.www.password) {
      done(null, userid);
    } else {
      done(null, false);
    }
  }));

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  const auth = passport.authenticate('basic');

  require('./apis/caterer').setup(router, db, auth);
  require('./apis/dish').setup(router, db, auth);
  require('./apis/restriction').setup(router, db, auth);
  require('./apis/dish_to_restriction').setup(router, db, auth);
  require('./apis/meal').setup(router, db, auth);
  require('./apis/menu').setup(router, db, auth);

  router.get('/menu/:week?', (req, res) => {
    res.write(
      pug.renderFile(path.join(__dirname, 'assets', 'templates', 'index.pug'),
        {
          base: `/${config.www.base}`,
          config,
        }));
    res.end();
  });

  router.get('/*', auth, (req, res) => {
    res.write(
      pug.renderFile(path.join(__dirname, 'assets', 'templates', 'index.pug'),
        {
          authorization: req.headers.authorization,
          config,
          base: `/${config.www.base}`,
        }));
    res.end();
  });

  router.post('/', (req, res) => {
    const params = req.body;
    const requestToken = params.token;
    const commandText = params.text || '';
    const commands = fs.readdirSync(__dirname + '/commands');

    let commandDefault;
    let commandRun = false;

    // force this to be false right now
    if (requestToken !== config.slack.token) {
      res.status(403).send('Invalid request token ' + requestToken);
    } else {
      let module;
      let command;

      while (commands.length > 0) {
        module = commands.pop();
        command = require('./commands/' + module);

        if (command.matches(commandText)) {
          commandRun = true;
          command.run(params, db, config).then(message => { // eslint-disable-line no-loop-func
            if (message) {
              res.json(message.getResponse());
            } else {
              res.send('');
            }
          }).catch((err) => { // eslint-disable-line no-loop-func
            res.status(500).send(err);
          });
          break;
        } else if (command.isDefault()) {
          commandDefault = command;
        }
      }

      if (!commandRun) {
        if (commandDefault) {
          commandDefault.run(params, db, config).then((message) => {
            if (message) {
              res.json(message.getResponse());
            } else {
              res.send('');
            }
          }).catch((err) => {
            res.status(500).send(err);
          });
        } else {
          res.status(500).send();
        }
      }
    }
  });

  return router;
};
