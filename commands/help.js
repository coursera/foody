"use strict";

const response = require('../slack/response');
const Message = require('../slack/message');
const Command = require('../slack/command');
const fs = require('fs');
const path = require('path');

const help = new Command(/help/, function(slack) {
  const tokenized = /help(?:\s+([^\s]+))?/.exec(slack.text.trim());
  const command = tokenized[1];
  const fullHelp = !command;

  let text = fullHelp ? 'happy to help! i can do many foody things, like:\n\n' : slack.command + ' ' + slack.text + '\n\n';

  fs.readdirSync(__dirname).forEach(function(file) {
    let moduleName = path.basename(file, '.js');
    if (moduleName != 'help') {
      let module = require('./' + file);
      if (module && module.getHelp) {
        let commandHelp = module.getHelp();

        if (commandHelp) {
          if (fullHelp) {
            text += slack.command + ' ' + commandHelp.command + '\n';
          } else if (module.matches(command)) {
            text += slack.command + ' ' + commandHelp.command + '\n' + commandHelp.text + '\n';
          }
        }
      }
    } else if (fullHelp) {
      text += slack.command + ' help\n';
    } else if (command === 'help') {
      text += slack.command + ' help\n';
      text += 'helps you again and again\n\n';
    }
  });

  if (fullHelp) {
    text += slack.command + ' ?\n';
  } else if (command && text === '') {
    text += 'i can not help you with _' + command + '_ right now.';
  }

  return new Promise((resolve, reject) => {
    resolve(new Message(text));
  });
});

module.exports = help;
