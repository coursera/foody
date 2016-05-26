var config = require('../config');

var Message = function(text) {
  this.response = {};

  this.setText(text);
  this.setResponseType(false);
}

Message.prototype.getResponse = function() {
  return this.response;
};

Message.prototype.setText = function(text) {
  this.response.text = text;
};

Message.prototype.setResponseType = function(inChannel) {
  this.response.response_type = inChannel ? 'in_channel' : 'ephemeral';
};

Message.prototype.addAttachment = function(attachment) {
  this.response.attachments = this.response.attachments || [];
  this.response.attachments.push(attachment);
};

Message.prototype.setUsername = function(user) {
  this.response.username = user;
};

Message.prototype.setIconUrl = function(url) {
  this.response.icon_url = url;
};

Message.prototype.setIconEmoji = function(emoji) {
  this.response.icon_emoji = ':' + emoji + ':';
};

Message.prototype.setChannel = function(channel) {
  this.response.channel = channel;
};

module.exports = Message;
