"use strict";

const response = require('../slack/response');
const Message = require('../slack/message');
const Command = require('../slack/command');

const matcher = (command) => {
  return /^(hi|hello|yo|sup)\s*$/.test(command);
};

const hi = new Command(matcher, (slack, db) => {
  return new Promise((resolve, reject) => {
    resolve(new Message(`hi @${slack.user_name}, are you hungry? if so, try "/foody help"`));
  });
});

hi.setHelp('hi', 'greet your friendly foody neighbor');

module.exports = hi;
