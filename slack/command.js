/* eslint-disable strict */
'use strict';

class Command {

  constructor(matcher, handler) {
    this.matcher = matcher;
    this.handler = handler;
    this._isDefault = false;
  }

  setHelp(command, text) {
    this.help = {
      command,
      text,
    };
  }

  run(slack, jira, context) {
    return this.handler(slack, jira, context);
  }

  getHelp() {
    return this.help;
  }

  setDefault(isDefault) {
    this._isDefault = isDefault;
  }

  isDefault() {
    return this._isDefault;
  }

  matches(command) {
    if (this.matcher instanceof RegExp) {
      return this.matcher.test(command);
    } else if (this.matcher instanceof Function) {
      return this.matcher(command);
    }

    return this.matcher === command;
  }
}

module.exports = Command;
