"use strict";

const response = require('../slack/response');
const Message = require('../slack/message');
const Command = require('../slack/command');
const emojis = require('../data/food-emojis');

const matcher = (command) => {
  return /(hungry|hangry|grumble|grumbly|feed)/.test(command);
};

const hungry = new Command(matcher, (slack, db, config) => {
  return new Promise((resolve, reject) => {
    const tokenize = slack.text.match(/@(\w+)/);
    const user = tokenize ? tokenize[1] : null;
    const emoji = emojis[Math.floor(Math.random()*(emojis.length - 1))];

    if (!user) {
      resolve(new Message(`:${emoji}:`));
    } else {
      response.sendTo(user, new Message(`@${slack.user_name} thinks you are hungry. here, have a :${emoji}:!`), config);
      resolve(new Message(`okay. i gave @${user} something to eat`));
    }
  });
});

hungry.setHelp('[i am | @user is] hungry', 'have foody satiate a hunger attack before the next meal is ready');

module.exports = hungry;
